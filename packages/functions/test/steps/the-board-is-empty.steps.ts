import { z } from 'zod'
import { pikkuPlatformScenarioStep } from '#pikku/scenarios'
import { withDevDatabase } from '../lib/dev-database.js'

export const TheBoardIsEmptyInput = z.object({
  slotId: z.string(),
})

export const TheBoardIsEmptyOutput = z.object({
  removed: z.number().int(),
})

/**
 * Clear one slot's board.
 *
 * The seed deliberately ships five questions so every screen has something on it
 * (knowledge/milestones/03-the-board-sorts-by-votes.md), which is right for looking
 * at and wrong for asserting "the backpressure question is at the top" — it would be
 * competing with whatever the seed left behind, and with whatever the previous
 * scenario posted.
 *
 * Votes go with the questions: `question_vote` has no cascade, and a vote pointing at
 * a deleted question would quietly inflate the next run's counts.
 */
export const theBoardIsEmpty = pikkuPlatformScenarioStep({
  name: 'theBoardIsEmpty',
  description: 'clears every question on one slot',
  template: 'the board for {slotId} is empty',
  input: TheBoardIsEmptyInput,
  output: TheBoardIsEmptyOutput,
  func: async (_services, { slotId }) => {
    return withDevDatabase((db) => {
      // Votes first: `question_vote` has no cascade, and a vote pointing at a deleted
      // question would quietly inflate the next run's counts.
      db.prepare(
        'DELETE FROM question_vote WHERE question_id IN (SELECT id FROM question WHERE talk_id = ?)',
      ).run(slotId)
      const result = db.prepare('DELETE FROM question WHERE talk_id = ?').run(slotId)
      return { removed: Number(result.changes ?? 0) }
    })
  },
})
