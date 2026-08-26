import { z } from 'zod'
import { pikkuScenarioStep } from '#pikku/scenarios'

export const TheRoomReachesInput = z.object({
  /** The slot the evening should arrive at, by id. */
  slotId: z.string(),
  /** How long to wait for it. The workflow moves on its own clock, so this is a bound, not a duration. */
  withinMs: z.number().default(30_000),
})

export const TheRoomReachesOutput = z.object({
  slotId: z.string(),
  title: z.string(),
  waitedMs: z.number(),
  /** Every slot the room was seen on while waiting, in the order it passed through them. */
  passedThrough: z.array(z.string()),
})

/**
 * Wait for the evening to ARRIVE somewhere, rather than assert where it is.
 *
 * `theRoomIsOn` reads the schedule once, which is the right shape when a human just
 * pressed a button. Nothing presses a button here: the `runTheMeetup` workflow is
 * asleep between slots and wakes on its own, so the only honest assertion is "the room
 * gets here, and within a bound".
 *
 * It polls `listSchedule` as an attendee for the same reason `theRoomIsOn` does — the
 * claim is about what forty phones show, not about a row in `event_state`. The slots it
 * sees on the way are returned so a scenario can assert the ROUTE, not only the
 * destination; a workflow that jumped straight to the end would otherwise pass.
 *
 * Failing on the bound is a real failure, not flake-avoidance: the workflow's durations
 * are seconds in a test, so a run that has not reached its next slot in thirty is stuck.
 */
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
