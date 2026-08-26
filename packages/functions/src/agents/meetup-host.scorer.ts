import { pikkuAgentJudge, pikkuAgentScorer } from '#pikku/agent'

/**
 * Is the answer short enough to say out loud?
 *
 * The agent's personality asks for "a sentence or two unless asked for a list",
 * and the failure this catches is not subtle enough to need a model: a host
 * holding a microphone in front of forty people either can read the answer or
 * cannot. Pure code, so it grades on the fast lane and every live run can be
 * graded without a bill.
 *
 * List lines are dropped before counting rather than penalised, because the
 * personality explicitly allows a list — counting them as prose would grade the
 * agent down for doing what it was told.
 */
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

/**
 * Did the answer come from the room, or from the model?
 *
 * The one thing the agent is told never to do is invent a question nobody
 * asked, and an invented one reads exactly like a real one — so the tell is not
 * in the text, it is in whether a tool ran at all before the answer named
 * something specific.
 *
 * `toolCalls: 'names'` on purpose. The judge is a third-party model, and the
 * results of `listAllQuestions` are attendees' own words with their names
 * attached; the disclosure needed to catch invention is only *which* tools ran
 * and whether they failed, so that is all it is shown. The cost is real: this
 * cannot tell a faithful summary from a subtly wrong one, only a tool-backed
 * answer from a fabricated one. That is the failure worth catching here.
 *
 * Sampled at 10% of live traffic — a scenario's `expectScore` ignores sampling
 * and grades every run, so the rubric stays under test whatever this is set to.
 */
export const grounded = pikkuAgentJudge({
  name: 'grounded',
  description: 'Whether the answer is backed by a tool call rather than invented.',
  model: 'openai/gpt-5-mini',
  sampleRate: 0.1,
  toolCalls: 'names',
  goal: `You are grading the assistant to the host of a Node.js meetup. It has tools for reading the night's questions and running order, and it is forbidden to invent a question nobody asked.

Score 1 when the answer either is backed by the tools that ran, or plainly says it cannot answer.
Score 0 when the answer states specifics about tonight — a question, a count, a talk, a speaker — with no tool call behind it, or when every tool call failed and the answer proceeds as if they had not.

Judge grounding only. A short answer, a blunt answer, or a refusal to guess are all correct here.`,
})
