import { z } from 'zod'
import { pikkuSessionlessFunc } from '#pikku/function'
import { QuestionSchema, TalkSchema } from './shared.js'
import { boardFor } from './board.js'

const STAGE_QUESTION_COUNT = 3

export const GetStageViewInput = z.object({})

export const GetStageViewOutput = z.object({
  currentTalk: TalkSchema,
  topQuestions: z.array(QuestionSchema),
  remaining: z.number().int(),
})

export const getStageView = pikkuSessionlessFunc({
  expose: true,
  readonly: true,
  auth: false,
  description: 'The projected view: the current talk and its top three questions.',
  input: GetStageViewInput,
  output: GetStageViewOutput,
  func: async ({ kysely }) => {
    const { currentTalk, questions } = await boardFor(kysely)

    return {
      currentTalk,
      topQuestions: questions.slice(0, STAGE_QUESTION_COUNT),
      remaining: Math.max(0, questions.length - STAGE_QUESTION_COUNT),
    }
  },
})
