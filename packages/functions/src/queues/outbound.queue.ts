import { wireQueueWorker } from '#pikku/queue'
import { pikkuMiddleware } from '#pikku/middleware'
import { sendTalkSummaryEmail } from '../functions/meetup/send-talk-summary-email.function.js'
import { postQuestionsAsIssues } from '../functions/meetup/post-questions-as-issues.function.js'

/**
 * The night's outbound work, off the critical path.
 *
 * Sending an email and opening a dozen issues are the two slowest things this
 * app does and the two least urgent. They belong to a talk that has just ENDED,
 * so nobody in the room is waiting on them, and neither should be able to make
 * the workflow that advances the schedule take a network round trip. The
 * workflow enqueues and moves on; if GitHub is down at 19:40 the queue retries
 * at 19:45 and the meetup never notices.
 *
 * Two queues rather than one worker doing both, because they fail for unrelated
 * reasons — a missing GitHub token must not cost the host their email.
 */

/**
 * Hands the GitHub addon its token.
 *
 * `@pikku/addon-github` reads `wire.getCredential('github')`, and credentials
 * resolve PER USER: `defaultPikkuUserIdResolver` looks for a session, and a
 * queue job has none. So there is nobody for the credential store to look the
 * token up under, and the addon would fail every job with "connect GitHub
 * first" no matter what the store held.
 *
 * `setCredential` is the documented way past that — it writes onto the wire
 * directly, ahead of the lazy load. This is the one place the token is read,
 * and it is read from `secrets`, never from a function body.
 *
 * An absent token is left absent rather than defaulted: the worker then reports
 * the addon's own unauthorized error, which says what is wrong, instead of a
 * 401 from GitHub about a token that was never set.
 */
const withGithubToken = pikkuMiddleware(async ({ secrets }, { setCredential }, next) => {
  const token = await secrets.getSecret('GITHUB_TOKEN').catch(() => null)
  if (token) {
    setCredential?.('github', { accessToken: token.reveal() })
  }
  await next()
})

wireQueueWorker({
  name: 'talk-summary-email',
  func: sendTalkSummaryEmail,
  config: {
    // One at a time. There are five slots in a night, the work is a single
    // send, and a concurrency knob here would only buy contention.
    batchSize: 1,
    removeOnComplete: 20,
    removeOnFail: 20,
  },
})

wireQueueWorker({
  name: 'github-issues',
  func: postQuestionsAsIssues,
  config: {
    // Also one at a time, but for a reason that matters: the worker itself
    // POSTs sequentially to stay inside GitHub's rate limit, and running two
    // talks' jobs at once would put that back.
    batchSize: 1,
    removeOnComplete: 20,
    removeOnFail: 20,
  },
  middleware: [withGithubToken],
})
