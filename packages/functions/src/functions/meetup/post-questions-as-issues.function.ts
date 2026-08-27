import { z } from 'zod'
import { pikkuSessionlessFunc } from '#pikku/function'
import { TalkJob } from './shared.js'
import { issuesRepo } from '../../lib/outbound.js'

export const PostQuestionsAsIssuesOutput = z.object({
  filed: z.number().int(),
  /** Present only when nothing was filed, saying which skip it was. */
  reason: z.string().optional(),
})

/**
 * File the questions the host did NOT get to as issues on the repo.
 *
 * `includeAnswered` is left off on purpose. An answered question got its answer
 * in the room and needs no ticket; what deserves to outlive the night is the
 * one the clock beat. So this is the unanswered half, and the email is the
 * whole — the two workers read the same night differently, which is why they
 * are two workers.
 *
 * Sequential rather than `Promise.all`: GitHub rate-limits issue creation, and
 * twelve parallel POSTs is how a demo gets a 403 in front of a room. A partial
 * failure throws, the job retries, and the questions already filed are filed
 * again — accepted, because a duplicate issue is cheap and a lost question is
 * the thing this exists to prevent.
 *
 * `createGithubIssue` currently opens nothing — see that function for why the
 * addon is gone and why this path was kept whole anyway.
 */
export const postQuestionsAsIssues = pikkuSessionlessFunc({
  auth: false,
  description: 'Open a GitHub issue for every question a talk did not get answered.',
  input: TalkJob,
  output: PostQuestionsAsIssuesOutput,
  func: async ({ variables, logger }, { talkId }, { rpc }) => {
    const repo = await issuesRepo(variables)
    if (!repo) {
      logger.info(`github-issues: no GITHUB_ISSUES_REPO set, skipping ${talkId}`)
      return { filed: 0, reason: 'no-repo' }
    }

    const { talks } = await rpc.invoke('listAllQuestions', { talkId })
    const talk = talks[0]
    if (!talk) {
      return { filed: 0, reason: 'unknown-talk' }
    }

    let filed = 0
    for (const question of talk.questions) {
      await rpc.invoke('createGithubIssue', {
        owner: repo.owner,
        repo: repo.repo,
        title: question.body.length > 80 ? `${question.body.slice(0, 77)}...` : question.body,
        // The body carries what the title had to drop, plus who asked and how
        // many people wanted it — an issue with 9 votes behind it is a different
        // issue from one with 1, and the number is gone the moment the night is.
        body: [
          question.body,
          '',
          `Asked by **${question.authorName}** during _${talk.title}_${talk.speaker ? ` (${talk.speaker})` : ''}.`,
          `${question.votes} ${question.votes === 1 ? 'person' : 'people'} wanted this answered.`,
          '',
          'Filed automatically from the meetup Q&A board — it ran out of time on the night.',
        ].join('\n'),
        labels: ['question', 'from-the-meetup'],
      })
      filed++
    }

    return { filed }
  },
})
