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
 * Carries the GitHub token to the worker, for when there is something to carry
 * it to.
 *
 * `@pikku/addon-github` used to read `wire.getCredential('github')`, and
 * credentials resolve PER USER: `defaultPikkuUserIdResolver` looks for a
 * session and a queue job has none, so the token had to be written onto the
 * wire directly. The addon is gone (pikkujs/pikku#1497) and the worker now
 * calls a local stand-in that opens nothing, so this sets a credential nobody
 * reads.
 *
 * It is kept because it is the seam: this is the ONE place the token is read,
 * and it is read from `secrets`, never from a function body. Whatever replaces
 * the addon — the addon fixed, or a direct `fetch` — collects it here, and that
 * rule survives the gap instead of being re-derived after it.
 *
 * An absent token is left absent rather than defaulted, so the failure names
 * the missing token rather than arriving as a 401 about one that was never set.
 *
 * No `.catch` around `getSecret`. GITHUB_TOKEN is declared `optional: true`, so
 * the generated map types it as an optional property and an unset token RESOLVES
 * to undefined — a rejection here would mean the secret store itself is broken,
 * and swallowing that would report a real outage as "no token configured".
 */
const withGithubToken = pikkuMiddleware(async ({ secrets }, { setCredential }, next) => {
  const token = await secrets.getSecret('GITHUB_TOKEN')
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
