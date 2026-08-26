import { z } from 'zod'
import { pikkuScenarioStep } from '#pikku/scenarios'

export const TheBoardReadsInput = z.object({
  /** The question expected at position one, matched as a substring. */
  top: z.string().optional(),
  /** Text that must NOT be on the board — an answered question, mostly. */
  absent: z.string().optional(),
  /** How many questions the board should be holding. */
  count: z.number().int().optional(),
  /** Read as this device, so `youVoted` reflects the right person. */
  attendeeId: z.string().optional(),
})

export const TheBoardReadsOutput = z.object({
  currentTalk: z.string(),
  bodies: z.array(z.string()),
  topVotes: z.number().int(),
})

/**
 * Read the Q&A board as a person and assert what is on it.
 *
 * An ACTOR step over the real transport rather than a database query, because the
 * ordering under test — votes desc, then oldest first — lives in the function, not in
 * the table. A step that read the rows directly would pass with the sort deleted.
 *
 * Every assertion is optional and they compose: one step call can say "the
 * backpressure question is top, the answered one is gone, and there are two left",
 * which is one sentence in the milestone's gherkin too.
 */
export const theBoardReads = pikkuScenarioStep({
  name: 'theBoardReads',
  actor: true,
  description: 'reads the board and asserts what is on it',
  template: 'the board has {top} on top',
  input: TheBoardReadsInput,
  output: TheBoardReadsOutput,
  default: async (_services, { top, absent, count, attendeeId }, { actor }) => {
    const board = await actor.invoke('listQuestions', { attendeeId })
    const bodies = board.questions.map((question) => question.body)

    if (top !== undefined && !(bodies[0] ?? '').includes(top)) {
      throw new Error(
        `Expected "${top}" at the top of the board, but it reads: ${JSON.stringify(bodies)}. ` +
          `Votes: ${JSON.stringify(board.questions.map((q) => q.votes))}.`,
      )
    }

    if (absent !== undefined && bodies.some((body) => body.includes(absent))) {
      throw new Error(
        `Expected "${absent}" to be off the board, but it reads: ${JSON.stringify(bodies)}.`,
      )
    }

    if (count !== undefined && bodies.length !== count) {
      throw new Error(
        `Expected ${count} question(s) on the board, found ${bodies.length}: ${JSON.stringify(bodies)}.`,
      )
    }

    return {
      currentTalk: board.currentTalk.title,
      bodies,
      topVotes: board.questions[0]?.votes ?? 0,
    }
  },
})
