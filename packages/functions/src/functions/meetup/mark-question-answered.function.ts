import { z } from 'zod'
import { pikkuSessionlessFunc } from '#pikku/function'
import { NotFoundError } from '@pikku/core/errors'
import { hasOrganiserPasscode } from '../../permissions.js'
import { now } from './shared.js'
import { publishLive } from './live.js'

export const MarkQuestionAnsweredInput = z.object({
  questionId: z.string(),
  passcode: z.string(),
})

export const MarkQuestionAnsweredOutput = z.object({
  questionId: z.string(),
  answeredAt: z.string(),
})

export const markQuestionAnswered = pikkuSessionlessFunc({
  expose: true,
  auth: false,
  description: 'Mark a question answered so it drops off the board.',
  input: MarkQuestionAnsweredInput,
  output: MarkQuestionAnsweredOutput,
  permissions: { organiser: hasOrganiserPasscode },
  func: async ({ kysely, eventHub, logger }, { questionId }) => {
    const question = await kysely
      .selectFrom('question')
      .select(['id', 'talkId', 'answeredAt'])
      .where('id', '=', questionId)
      .executeTakeFirst()

    if (!question) {
      throw new NotFoundError('That question is not on the board.')
    }
    if (question.answeredAt) {
      return { questionId, answeredAt: question.answeredAt }
    }

    const answeredAt = now()
    await kysely.updateTable('question').set({ answeredAt }).where('id', '=', questionId).execute()

    await publishLive(
      eventHub,
      { kind: 'question-answered', talkId: question.talkId, questionId },
      logger,
    )

    return { questionId, answeredAt }
  },
})
