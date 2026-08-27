import { z } from 'zod'
import { pikkuPlatformScenarioStep } from '#pikku/scenarios'
import { withDevDatabase } from '../lib/dev-database.js'

export const TheCurrentSlotIsInput = z.object({
  slotId: z.string(),
})

export const TheCurrentSlotIsOutput = z.object({
  slotId: z.string(),
  title: z.string(),
})

export const theCurrentSlotIs = pikkuPlatformScenarioStep({
  name: 'theCurrentSlotIs',
  description: 'puts the evening at a known slot',
  template: 'the current slot is {slotId}',
  input: TheCurrentSlotIsInput,
  output: TheCurrentSlotIsOutput,
  func: async (_services, { slotId }) => {
    return withDevDatabase((db) => {
      const slot = db.prepare('SELECT id, title FROM talk WHERE id = ?').get(slotId) as
        | { id: string; title: string }
        | undefined

      if (!slot) {
        throw new Error(
          `No slot \`${slotId}\` in tonight's running order. The seeded ids are slot-doors, ` +
            `slot-intro, slot-talk-1, slot-break, slot-talk-2, slot-pizza and slot-close.`,
        )
      }

      db.prepare('UPDATE event_state SET current_talk_id = ? WHERE id = 1').run(slotId)

      return { slotId, title: slot.title }
    })
  },
})
