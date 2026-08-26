import { z } from 'zod'
import { pikkuSessionlessFunc } from '#pikku/function'
import { TalkJob } from './shared.js'

export const SendTalkSummaryEmailOutput = z.object({
  /** False when nothing was sent, with `reason` saying which of the two skips it was. */
  sent: z.boolean(),
  questionCount: z.number().int(),
  reason: z.string().optional(),
})

/**
 * Email the host what the room asked during one talk.
 *
 * `includeAnswered: true`, unlike the board: the board is a queue of what is
 * still owed and hides what the host got through, but this is a record of the
 * night, and a question that was answered out loud is the best kind of question
 * to have received. They are marked in the email rather than dropped.
 *
 * A missing ORGANISER_EMAIL returns `sent: false` rather than throwing. This is
 * a queue worker: throwing means retry, and no amount of retrying will make an
 * unconfigured address appear.
 */
export const sendTalkSummaryEmail = pikkuSessionlessFunc({
  auth: false,
  description: 'Email the organiser the questions one talk drew, most-wanted first.',
  input: TalkJob,
  output: SendTalkSummaryEmailOutput,
  func: async ({ emailService, variables, logger }, { talkId }, { rpc }) => {
    const to = await variables.get('ORGANISER_EMAIL')
    const { talks } = await rpc.invoke('listAllQuestions', {
      talkId,
      includeAnswered: true,
    })
    const talk = talks[0]
    const questions = talk?.questions ?? []

    if (!to) {
      logger.info(`talk-summary: no ORGANISER_EMAIL set, skipping ${talkId}`)
      return { sent: false, questionCount: questions.length, reason: 'no-organiser-email' }
    }
    if (!talk) {
      return { sent: false, questionCount: 0, reason: 'unknown-talk' }
    }

    // Built as a named const rather than inline, because the generated template
    // variable map lists `#each questions` (the block opener) and not
    // `questions`, so an object LITERAL trips excess-property checking on the
    // very key the template iterates. A named object is not fresh and passes.
    const data = {
      talkTitle: talk.title,
      questionCount: questions.length,
      askerCount: new Set(questions.map((question) => question.authorName)).size,
      questions,
    }

    await emailService.send({
      to,
      template: { name: 'talk-summary', data },
    })

    return { sent: true, questionCount: questions.length }
  },
})
