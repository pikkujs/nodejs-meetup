import { z } from 'zod'
import { pikkuScenarioStep } from '#pikku/scenarios'

export const TheBoardReadsInput = z.object({
  top: z.string().optional(),
  absent: z.string().optional(),
  count: z.number().int().optional(),
  attendeeId: z.string().optional(),
})

export const TheBoardReadsOutput = z.object({
  currentTalk: z.string(),
  bodies: z.array(z.string()),
  topVotes: z.number().int(),
})

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
