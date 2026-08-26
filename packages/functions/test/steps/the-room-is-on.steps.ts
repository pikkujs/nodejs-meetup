import { z } from 'zod'
import { pikkuScenarioStep } from '#pikku/scenarios'

export const TheRoomIsOnInput = z.object({
  /** The slot the room should believe is live, by id. */
  slotId: z.string(),
})

export const TheRoomIsOnOutput = z.object({
  slotId: z.string(),
  title: z.string(),
})

/**
 * Assert what the ROOM thinks is happening, from the schedule everyone reads.
 *
 * Not a database check on `event_state`, and not a re-read of the organiser's own
 * response: the claim under test is that advancing the schedule changes what forty
 * phones show. Reading it back through `listSchedule` as an attendee is the only way
 * to prove that, and it is one join away from being wrong.
 */
export const theRoomIsOn = pikkuScenarioStep({
  name: 'theRoomIsOn',
  actor: true,
  description: 'asserts which slot the public schedule marks as current',
  template: 'the room is on {slotId}',
  input: TheRoomIsOnInput,
  output: TheRoomIsOnOutput,
  default: async (_services, { slotId }, { actor }) => {
    const schedule = await actor.invoke('listSchedule', {})
    const current = schedule.slots.find((slot) => slot.isCurrent)

    if (!current) {
      throw new Error('The schedule marks no slot as current. Exactly one always should be.')
    }

    if (schedule.currentTalkId !== slotId || current.id !== slotId) {
      throw new Error(
        `Expected the room to be on \`${slotId}\`, but the schedule says \`${current.id}\` ` +
          `("${current.title}").`,
      )
    }

    return { slotId, title: current.title }
  },
})
