import { z } from 'zod'
import { pikkuSessionlessFunc } from '#pikku/function'
import { ConflictError, NotFoundError } from '@pikku/core/errors'
import { AttendeeId, now } from './shared.js'
import { publishLive } from './live.js'

export const UpvoteQuestionInput = z.object({
  questionId: z.string(),
  attendeeId: AttendeeId,
})

export const UpvoteQuestionOutput = z.object({
  questionId: z.string(),
  votes: z.number().int(),
})

export const upvoteQuestion = pikkuSessionlessFunc({
  expose: true,
  auth: false,
  description: 'Upvote a question. One vote per device, and no taking it back.',
  input: UpvoteQuestionInput,
  output: UpvoteQuestionOutput,
  func: async ({ kysely, eventHub, logger }, { questionId, attendeeId }) => {
    const question = await kysely
      .selectFrom('question')
      .select(['id', 'talkId', 'answeredAt'])
      .where('id', '=', questionId)
      .executeTakeFirst()

    if (!question) {
      throw new NotFoundError('That question is not on the board.')
    }
    if (question.answeredAt) {
      throw new ConflictError('That question has already been answered.')
    }

    const inserted = await kysely
      .insertInto('questionVote')
      .values({ questionId, attendeeId, createdAt: now() })
      .onConflict((conflict) => conflict.columns(['questionId', 'attendeeId']).doNothing())
      .executeTakeFirst()

    if (Number(inserted?.numInsertedOrUpdatedRows ?? 0) === 0) {
      throw new ConflictError('You have already voted for that one.')
    }

    const { votes } = await kysely
      .selectFrom('questionVote')
      .select(({ fn }) => fn.count<number>('attendeeId').as('votes'))
      .where('questionId', '=', questionId)
      .executeTakeFirstOrThrow()

    await publishLive(
      eventHub,
      { kind: 'question-upvoted', talkId: question.talkId, questionId, votes: Number(votes) },
      logger,
    )

    return { questionId, votes: Number(votes) }
  },
})
