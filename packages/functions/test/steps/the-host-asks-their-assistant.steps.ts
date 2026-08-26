import { z } from 'zod'
import { pikkuScenarioStep } from '#pikku/scenarios'

export const TheHostAsksTheirAssistantInput = z.object({
  message: z.string(),
})

export const TheHostAsksTheirAssistantOutput = z.object({
  answer: z.string(),
  /** The handle `expectScore` grades the run by. */
  runId: z.string(),
})

/**
 * Say something to the host's assistant and keep the run's id.
 *
 * The answer itself is deliberately not asserted on here. An agent's reply is not
 * comparable to a fixed string, so the assertion is the scorer's job — this step
 * exists to trigger a run and hand its id to `expectScore`.
 */
export const theHostAsksTheirAssistant = pikkuScenarioStep({
  name: 'theHostAsksTheirAssistant',
  actor: true,
  description: "asks the host's assistant a question",
  template: 'the host asks their assistant: {message}',
  input: TheHostAsksTheirAssistantInput,
  output: TheHostAsksTheirAssistantOutput,
  default: async (_services, { message }, { actor }) => {
    const { answer, runId } = await actor.invoke('askTheHost', {
      message,
      attendeeId: 'scenario-host-phone',
    })

    return { answer, runId }
  },
})
