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

/**
 * It has been asked out loud. Take it off the board.
 *
 * The row is stamped, never deleted: this is the app forgetting, not the database
 * losing. It disappears from every board immediately, on the phones and on the
 * wall — knowledge/decisions/design/the-board-is-a-queue.md.
 *
 * The one edit an organiser makes to somebody else's words, and it is not an edit
 * to the words.
 *
 * Marking an already-answered question again is a no-op that reports the ORIGINAL
 * timestamp. Two organisers with the passcode and one laptop each is the normal
 * case, and neither of them should see an error for agreeing.
 */
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
    await kysely
      .updateTable('question')
      .set({ answeredAt })
      .where('id', '=', questionId)
      .execute()

    await publishLive(
      eventHub,
      { kind: 'question-answered', talkId: question.talkId, questionId },
      logger,
    )

    return { questionId, answeredAt }
  },
})
