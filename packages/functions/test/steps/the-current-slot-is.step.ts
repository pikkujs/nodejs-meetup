import { z } from 'zod'
import { pikkuPlatformScenarioStep } from '#pikku/scenarios'
import { withDevDatabase } from '../lib/dev-database.js'

export const TheCurrentSlotIsInput = z.object({
  /** A seeded slot id, e.g. `slot-talk-1`. */
  slotId: z.string(),
})

export const TheCurrentSlotIsOutput = z.object({
  slotId: z.string(),
  title: z.string(),
})

/**
 * Put the evening back at a known slot.
 *
 * A PLATFORM step, not a persona one: "the evening is at talk one" is the app's own
 * state, and the only human who could arrange it is the organiser — whose ability to
 * do so is itself under test in milestone 05. A scenario that arranged its
 * precondition by advancing the schedule would be asserting the thing it assumed.
 *
 * Every scenario that cares which slot is live begins with this, because scenarios
 * share one database and one `event_state` row, and the order they run in is not a
 * promise.
 */
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
