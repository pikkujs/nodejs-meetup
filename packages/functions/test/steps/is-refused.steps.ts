import { z } from 'zod'
import { pikkuScenarioStep } from '#pikku/scenarios'

export const IsRefusedInput = z.object({
  rpcName: z.enum(['advanceSchedule', 'markQuestionAnswered']),
  passcode: z.string(),
  questionId: z.string().optional(),
})

export const IsRefusedOutput = z.object({
  status: z.number(),
})

export const isRefused = pikkuScenarioStep({
  name: 'isRefused',
  actor: true,
  description: 'asserts an organiser action is refused',
  template: 'is refused {rpcName}',
  input: IsRefusedInput,
  output: IsRefusedOutput,
  default: async (_services, { rpcName, passcode, questionId }, { actor }) => {
    const response =
      rpcName === 'markQuestionAnswered'
        ? await actor.invokeRaw(rpcName, { passcode, questionId: questionId ?? '' })
        : await actor.invokeRaw(rpcName, { passcode })

    if (response.ok) {
      throw new Error(
        `\`${rpcName}\` succeeded with the passcode "${passcode}". The permission on the ` +
          `function is the only thing standing between the room and the schedule — if this ` +
          `passes, it is not standing.`,
      )
    }

    return { status: response.status }
  },
})
