import { z } from 'zod'
import { pikkuScenarioStep } from '#pikku/scenarios'

export const TheRoomReachesInput = z.object({
  slotId: z.string(),
  withinMs: z.number().default(30_000),
})

export const TheRoomReachesOutput = z.object({
  slotId: z.string(),
  title: z.string(),
  waitedMs: z.number(),
  passedThrough: z.array(z.string()),
})

export const theRoomReaches = pikkuScenarioStep({
  name: 'theRoomReaches',
  actor: true,
  description: 'waits for the running order to arrive at a slot',
  template: 'the room reaches {slotId}',
  input: TheRoomReachesInput,
  output: TheRoomReachesOutput,
  default: async (_services, { slotId, withinMs }, { actor }) => {
    const startedAt = Date.now()
    const passedThrough: string[] = []
    let last: { id: string; title: string } | undefined

    while (Date.now() - startedAt < withinMs) {
      const schedule = await actor.invoke('listSchedule', {})
      const current = schedule.slots.find((slot) => slot.isCurrent)

      if (current && current.id !== last?.id) {
        passedThrough.push(current.id)
        last = { id: current.id, title: current.title }
      }

      if (last?.id === slotId) {
        return { slotId, title: last.title, waitedMs: Date.now() - startedAt, passedThrough }
      }

      await new Promise((resolve) => setTimeout(resolve, 250))
    }

    throw new Error(
      `The room never reached \`${slotId}\` within ${withinMs}ms. It got as far as ` +
        `\`${last?.id ?? 'nowhere'}\`, having passed through: ${passedThrough.join(' -> ') || '(nothing)'}. ` +
        `A run that stops early usually means a workflow step threw — the dev server log names the step.`,
    )
  },
})
