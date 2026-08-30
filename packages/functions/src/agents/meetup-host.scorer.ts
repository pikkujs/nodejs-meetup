import { pikkuAgentJudge, pikkuAgentScorer } from '#pikku/agent'

export const readAloud = pikkuAgentScorer({
  name: 'readAloud',
  description: 'Whether the answer is short enough to say to a room, ignoring lists.',
  score: ({ output }) => {
    const prose = output
      .split('\n')
      .filter((line) => !/^\s*([-*•]|\d+[.)])\s/.test(line))
      .join(' ')
      .trim()

    const sentences = prose.split(/[.!?]+(?:\s|$)/).filter((s) => s.trim().length > 0).length

    if (sentences <= 2) {
      return { score: 1, reason: `${sentences} sentence(s) of prose.` }
    }

    return {
      score: Math.max(0, 1 - (sentences - 2) / 4),
      reason: `${sentences} sentences of prose — too long to read to a room.`,
    }
  },
})

export const grounded = pikkuAgentJudge({
  name: 'grounded',
  description: 'Whether the answer is backed by a tool call rather than invented.',
  model: 'default',
  sampleRate: 0.1,
  toolCalls: 'names',
  goal: `You are grading the assistant to the host of a Node.js meetup. It has tools for reading the night's questions and running order, and it is forbidden to invent a question nobody asked.

Score 1 when the answer either is backed by the tools that ran, or plainly says it cannot answer.
Score 0 when the answer states specifics about tonight — a question, a count, a talk, a speaker — with no tool call behind it, or when every tool call failed and the answer proceeds as if they had not.

Judge grounding only. A short answer, a blunt answer, or a refusal to guess are all correct here.`,
})
