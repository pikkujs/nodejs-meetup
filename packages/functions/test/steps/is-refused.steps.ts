import { z } from 'zod'
import { pikkuScenarioStep } from '#pikku/scenarios'

export const IsRefusedInput = z.object({
  /** The organiser-only RPC to attempt. An enum, so a typo is a compile error. */
  rpcName: z.enum(['advanceSchedule', 'markQuestionAnswered']),
  /** The passcode to attempt it with — wrong, or missing entirely. */
  passcode: z.string(),
  /** For `markQuestionAnswered`, which question. Ignored otherwise. */
  questionId: z.string().optional(),
})

export const IsRefusedOutput = z.object({
  status: z.number(),
})

/**
 * Assert that an organiser action is refused without the passcode.
 *
 * `invokeRaw`, not `invoke`: a refusal is the EXPECTED outcome here, and the scenario
 * grammar has no try/catch to turn a thrown rejection back into a pass. The status is
 * returned so the run record shows a 403 rather than "it threw, probably correctly".
 *
 * Deliberately reaches the transport as a signed-in attendee. The point of milestone
 * 05's third scenario is that having a session, a device id and the URL buys you
 * nothing — the passcode on the function is the gate, and the nav listing
 * `/app/organiser` for everybody is safe precisely because of this.
 */
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
