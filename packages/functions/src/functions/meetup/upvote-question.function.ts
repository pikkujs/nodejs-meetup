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

/**
 * Put your hand up for someone else's question.
 *
 * A second vote from the same device is REFUSED, not quietly ignored. Silently
 * succeeding would leave the phone showing a cast vote and a count that did not
 * move, which reads as a broken app; a refusal lets the client say "you already
 * voted for this" and be right.
 *
 * There is no un-vote — knowledge/decisions/design/the-board-is-a-queue.md.
 *
 * The uniqueness is the primary key's, not a read-then-write's: two phones
 * tapping the same row in the same tick both pass a `SELECT`, and only one can
 * pass the insert.
 */
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
    // Answered questions leave the board, so voting on one means the phone is
    // holding a board from before the host got to it.
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

    // The authoritative count, straight from the row that was just written, so
    // every board applies the same number instead of each computing its own from
    // a local increment. Two votes in the same second therefore converge rather
    // than racing to different totals.
    await publishLive(
      eventHub,
      { kind: 'question-upvoted', talkId: question.talkId, questionId, votes: Number(votes) },
      logger,
    )

    return { questionId, votes: Number(votes) }
  },
})
