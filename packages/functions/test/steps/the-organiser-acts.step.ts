import { z } from 'zod'
import { pikkuScenarioStep } from '#pikku/scenarios'

export const TheOrganiserActsInput = z.object({
  action: z.enum(['checkOrganiserPasscode', 'advanceSchedule', 'markQuestionAnswered']),
  /** Which question, for `markQuestionAnswered`. */
  questionId: z.string().optional(),
})

export const TheOrganiserActsOutput = z.object({
  action: z.string(),
})

/**
 * Do an organiser action with the REAL passcode.
 *
 * The passcode is read from the environment inside the step and never appears in a
 * scenario body — the whole point of `defineSecret('organiserPasscode')` is that the
 * value lives in `.env` and nowhere in the repository, and a test file that hardcoded
 * it would put it there permanently, in git history, for a passcode that is read out
 * to a room and reused next month.
 *
 * Straight from `process.env`, not from the `secrets` service: a scenario step is typed
 * against `SecretlessServices`, deliberately, so that a step can never become the thing
 * that reveals a secret to a run record. This step reads the same variable
 * `defineSecret` points at, and is the one place in the test suite that does.
 *
 * The wrong-passcode half of milestone 05 does NOT use this step — it passes a literal,
 * because a wrong passcode is not a secret.
 */
export const theOrganiserActs = pikkuScenarioStep({
  name: 'theOrganiserActs',
  actor: true,
  description: 'performs an organiser action with the real passcode',
  template: 'the organiser does {action}',
  input: TheOrganiserActsInput,
  output: TheOrganiserActsOutput,
  default: async (_services, { action, questionId }, { actor }) => {
    const passcode = process.env.ORGANISER_PASSCODE
    if (!passcode) {
      throw new Error(
        'ORGANISER_PASSCODE is not in the environment, so no scenario can act as the organiser. ' +
          'It lives in .env beside SCENARIO_ACTOR_SECRET.',
      )
    }

    if (action === 'markQuestionAnswered') {
      if (!questionId) {
        throw new Error('markQuestionAnswered needs a questionId.')
      }
      await actor.invoke('markQuestionAnswered', { questionId, passcode })
    } else if (action === 'checkOrganiserPasscode') {
      await actor.invoke('checkOrganiserPasscode', { passcode })
    } else {
      await actor.invoke('advanceSchedule', { passcode })
    }

    return { action }
  },
})
