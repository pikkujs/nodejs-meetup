import { z } from 'zod'
import { pikkuSessionlessFunc } from '#pikku/function'
import { TalkJob } from './shared.js'
import { issuesRepo } from '../../lib/outbound.js'

export const PostQuestionsAsIssuesOutput = z.object({
  filed: z.number().int(),
  reason: z.string().optional(),
})

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
