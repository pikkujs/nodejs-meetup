import { z } from 'zod'
import { pikkuSessionlessFunc } from '#pikku/function'
import { QuestionSchema, TalkSchema } from './shared.js'
import { boardFor } from './board.js'

/** Three. Any more and the type has to shrink below what the back row can read. */
const STAGE_QUESTION_COUNT = 3

export const GetStageViewInput = z.object({})

export const GetStageViewOutput = z.object({
  currentTalk: TalkSchema,
  /** The top three, most-wanted first. Fewer if the board is short; never more. */
  topQuestions: z.array(QuestionSchema),
  /** How many are waiting behind the three on screen — the wall says "+7 more". */
  remaining: z.number().int(),
})

/**
 * What the projector shows.
 *
 * ONE call, not three. The laptop plugged into the projector makes this request
 * every three seconds for two hours and is watched by nobody, so it gets one
 * request that either works or visibly does not — never a screen that is half
 * refreshed because the second of three calls failed.
 *
 * Public, deliberately: a projector does not type a passcode, and a stranger who
 * loads this sees what is already on the wall behind them —
 * knowledge/decisions/security/one-shared-passcode.md.
 */
export const getStageView = pikkuSessionlessFunc({
  expose: true,
  readonly: true,
  auth: false,
  description: 'The projected view: the current talk and its top three questions.',
  input: GetStageViewInput,
  output: GetStageViewOutput,
  func: async ({ kysely }) => {
    // No attendee id: the wall has no votes of its own, so every `youVoted` is
    // false and the projected controls are decoration, not state.
    const { currentTalk, questions } = await boardFor(kysely)

    return {
      currentTalk,
      topQuestions: questions.slice(0, STAGE_QUESTION_COUNT),
      remaining: Math.max(0, questions.length - STAGE_QUESTION_COUNT),
    }
  },
})
