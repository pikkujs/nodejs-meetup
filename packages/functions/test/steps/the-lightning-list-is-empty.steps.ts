import { z } from 'zod'
import { pikkuPlatformScenarioStep } from '#pikku/scenarios'
import { withDevDatabase } from '../lib/dev-database.js'

export const TheLightningListIsEmptyInput = z.object({})

export const TheLightningListIsEmptyOutput = z.object({
  removed: z.number().int(),
})

/**
 * Clear the lightning list.
 *
 * Necessary rather than tidy: `lightning_slot.attendee_id` is UNIQUE, so a scenario
 * that signed a fixed device up would pass once and fail on every run after — and
 * "fails the second time you run it" is the worst failure mode a test has, because it
 * looks like a regression in the app.
 *
 * The alternative was a per-run random device id, which leaves the list growing all
 * night and makes "his name is on the list in the order he signed up" untestable after
 * the first run.
 */
export const theLightningListIsEmpty = pikkuPlatformScenarioStep({
  name: 'theLightningListIsEmpty',
  description: 'clears the lightning talk list',
  template: 'the lightning list is empty',
  input: TheLightningListIsEmptyInput,
  output: TheLightningListIsEmptyOutput,
  func: async () => {
    return withDevDatabase((db) => {
      const result = db.prepare('DELETE FROM lightning_slot').run()
      return { removed: Number(result.changes ?? 0) }
    })
  },
})
