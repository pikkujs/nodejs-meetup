import { z } from 'zod'
import { pikkuPlatformScenarioStep } from '#pikku/scenarios'
import { withDevDatabase } from '../lib/dev-database.js'

export const TheBoardIsEmptyInput = z.object({
  slotId: z.string(),
})

export const TheBoardIsEmptyOutput = z.object({
  removed: z.number().int(),
})

export const theBoardIsEmpty = pikkuPlatformScenarioStep({
  name: 'theBoardIsEmpty',
  description: 'clears every question on one slot',
  template: 'the board for {slotId} is empty',
  input: TheBoardIsEmptyInput,
  output: TheBoardIsEmptyOutput,
  func: async (_services, { slotId }) => {
    return withDevDatabase((db) => {
      db.prepare(
        'DELETE FROM question_vote WHERE question_id IN (SELECT id FROM question WHERE talk_id = ?)',
      ).run(slotId)
      const result = db.prepare('DELETE FROM question WHERE talk_id = ?').run(slotId)
      return { removed: Number(result.changes ?? 0) }
    })
  },
})
