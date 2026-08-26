import { z } from 'zod'
import { pikkuSessionlessFunc } from '#pikku/function'
import { AttendeeId, QuestionSchema, TalkSchema } from './shared.js'
import { boardFor } from './board.js'

export const ListQuestionsInput = z.object({
  /**
   * Optional: a phone that has not been named yet still gets the board, it just
   * cannot be told which votes are its own.
   */
  attendeeId: AttendeeId.optional(),
})

export const ListQuestionsOutput = z.object({
  /** Whatever is on now. The board follows it and never offers a picker. */
  currentTalk: TalkSchema,
  /**
   * Empty during an interlude, and empty is CORRECT there — see
   * knowledge/decisions/qa-follows-the-current-talk.md. The client reads
   * `currentTalk.kind` to decide between "no questions yet" and "we're on a break".
   */
  questions: z.array(QuestionSchema),
})

/**
 * The board: unanswered questions for the current talk, most-wanted first.
 *
 * Polled every few seconds by every phone in the room
 * (knowledge/decisions/live-means-polling.md), so it is a fixed two queries —
 * never one per row.
 */
export const listQuestions = pikkuSessionlessFunc({
  expose: true,
  readonly: true,
  auth: false,
  description: 'The Q&A board for the current talk, sorted by votes.',
  input: ListQuestionsInput,
  output: ListQuestionsOutput,
  func: async ({ kysely }, { attendeeId }) => boardFor(kysely, attendeeId),
})
