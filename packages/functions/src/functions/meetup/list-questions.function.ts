import { z } from 'zod'
import { pikkuSessionlessFunc } from '#pikku/function'
import { AttendeeId, QuestionSchema, TalkSchema } from './shared.js'
import { boardFor } from './board.js'

export const ListQuestionsInput = z.object({
  attendeeId: AttendeeId.optional(),
})

export const ListQuestionsOutput = z.object({
  currentTalk: TalkSchema,
  questions: z.array(QuestionSchema),
})

export const listQuestions = pikkuSessionlessFunc({
  expose: true,
  readonly: true,
  auth: false,
  description: 'The Q&A board for the current talk, sorted by votes.',
  input: ListQuestionsInput,
  output: ListQuestionsOutput,
  func: async ({ kysely }, { attendeeId }) => boardFor(kysely, attendeeId),
})
