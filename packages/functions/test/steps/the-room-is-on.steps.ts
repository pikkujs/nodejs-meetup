import { z } from 'zod'
import { pikkuScenarioStep } from '#pikku/scenarios'

export const TheRoomIsOnInput = z.object({
  slotId: z.string(),
})

export const TheRoomIsOnOutput = z.object({
  slotId: z.string(),
  title: z.string(),
})

export const theRoomIsOn = pikkuScenarioStep({
  name: 'theRoomIsOn',
  actor: true,
  description: 'asserts which slot the public schedule marks as current',
  template: 'sees the room on {slotId}',
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
