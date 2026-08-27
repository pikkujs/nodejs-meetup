import { z } from 'zod'
import { pikkuScenarioStep } from '#pikku/scenarios'

export const TheOrganiserActsInput = z.object({
  action: z.enum([
    'checkOrganiserPasscode',
    'advanceSchedule',
    'markQuestionAnswered',
    'startMeetupRun',
  ]),
  questionId: z.string().optional(),
  talkDuration: z.string().optional(),
  interludeDuration: z.string().optional(),
})

export const TheOrganiserActsOutput = z.object({
  action: z.string(),
  runId: z.string().optional(),
})

export const theOrganiserActs = pikkuScenarioStep({
  name: 'theOrganiserActs',
  actor: true,
  description: 'performs an organiser action with the real passcode',
  template: 'does {action}',
  input: TheOrganiserActsInput,
  output: TheOrganiserActsOutput,
  default: async (
    _services,
    { action, questionId, talkDuration, interludeDuration },
    { actor },
  ) => {
    const passcode = process.env.ORGANISER_PASSCODE
    if (!passcode) {
      throw new Error(
        'ORGANISER_PASSCODE is not in the environment, so no scenario can act as the organiser. ' +
          'It lives in .env beside SCENARIO_ACTOR_SECRET.',
      )
    }

    if (action === 'startMeetupRun') {
      const { runId } = await actor.invoke('startMeetupRun', {
        passcode,
        talkDuration: talkDuration ?? '20s',
        interludeDuration: interludeDuration ?? '10s',
      })
      return { action, runId }
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
