import { z } from 'zod'
import { pikkuScenarioStep } from '#pikku/scenarios'

export const TheVoteIsRefusedInput = z.object({
  questionId: z.string(),
  attendeeId: z.string(),
  votes: z.number().int(),
})

export const TheVoteIsRefusedOutput = z.object({
  status: z.number(),
  votes: z.number().int(),
})

export const theVoteIsRefused = pikkuScenarioStep({
  name: 'theVoteIsRefused',
  actor: true,
  description: 'asserts a repeat vote is refused and the count is unchanged',
  template: 'is refused a second vote on {questionId}',
  input: TheVoteIsRefusedInput,
  output: TheVoteIsRefusedOutput,
  default: async (_services, { questionId, attendeeId, votes }, { actor }) => {
    const response = await actor.invokeRaw('upvoteQuestion', { questionId, attendeeId })

    if (response.ok) {
      throw new Error(
        `The same device voted twice on \`${questionId}\` and was allowed to. ` +
          `One person, one vote is the only thing that makes the board a ranking.`,
      )
    }

    const board = await actor.invoke('listQuestions', { attendeeId })
    const question = board.questions.find((row) => row.id === questionId)

    if (!question) {
      throw new Error(`\`${questionId}\` is no longer on the board at all.`)
    }

    if (question.votes !== votes) {
      throw new Error(
        `The refused vote still moved the count: expected ${votes}, found ${question.votes}.`,
      )
    }

    return { status: response.status, votes: question.votes }
  },
})
