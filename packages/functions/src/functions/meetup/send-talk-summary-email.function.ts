import { z } from 'zod'
import { pikkuSessionlessFunc } from '#pikku/function'
import { TalkJob } from './shared.js'

export const SendTalkSummaryEmailOutput = z.object({
  sent: z.boolean(),
  questionCount: z.number().int(),
  reason: z.string().optional(),
})

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
