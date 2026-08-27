import { z } from 'zod'
import { pikkuScenarioStep } from '#pikku/scenarios'

export const TheHostAsksTheirAssistantInput = z.object({
  message: z.string(),
})

export const TheHostAsksTheirAssistantOutput = z.object({
  answer: z.string(),
  runId: z.string(),
})

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
