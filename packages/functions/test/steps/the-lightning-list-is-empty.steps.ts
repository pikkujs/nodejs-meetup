import { z } from 'zod'
import { pikkuPlatformScenarioStep } from '#pikku/scenarios'
import { withDevDatabase } from '../lib/dev-database.js'

export const TheLightningListIsEmptyInput = z.object({})

export const TheLightningListIsEmptyOutput = z.object({
  removed: z.number().int(),
})

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
