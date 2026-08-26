import { pikkuScenario } from '#pikku/scenarios'

const PRIYA_DEVICE = 'scenario-priya-phone'
const BACKPRESSURE = 'How do you actually apply backpressure across a stream pipeline?'

/**
 * The host's assistant, graded rather than matched.
 *
 * An agent's answer is not comparable to a fixed string — ask the same thing twice
 * and the words differ — so nothing here asserts what it said. What is asserted is
 * that the two rubrics on the agent hold: the answer is short enough to read to a
 * room (`readAloud`), and it came from a tool rather than from the model's own
 * imagination (`grounded`).
 *
 * A real question is planted first, so "summarise the questions" has something true
 * to find. Without it the honest answer is "nobody has asked anything", which
 * `grounded` scores 1 for and `readAloud` scores 1 for — the scenario would pass
 * while grading a run that never touched the room.
 *
 * Tagged `ai-live`: `grounded` is a judge, so this costs two model calls (the run
 * and the grading) and the default suite excludes it. `expectScore` ignores the
 * scorer's live `sampleRate`, so the 10% set on `grounded` does not make this
 * flaky — every run here is graded.
 */
export const theAssistantAnswersFromTheRoomScenario = pikkuScenario<void, { answer: string }>({
  title: 'The assistant answers from the room',
  description: "The host's assistant is short enough to read aloud and backed by a tool call",
  tags: ['scenario', 'questions', 'ai-live'],
  func: async (_services, _data, { scenario, actors }) => {
    if (!actors?.priya || !actors?.sam) {
      throw new Error('This scenario needs the priya and sam actors.')
    }

    await scenario.given('the evening is at talk one', 'theCurrentSlotIs', {
      slotId: 'slot-talk-1',
    })
    await scenario.given('the board is clear', 'theBoardIsEmpty', { slotId: 'slot-talk-1' })

    await scenario.do(
      'priya has asked about backpressure',
      'askQuestion',
      { body: BACKPRESSURE, authorName: 'Priya', attendeeId: PRIYA_DEVICE },
      { actor: actors.priya },
    )

    const asked = await scenario.when(
      'sam asks for the room in one line',
      'theHostAsksTheirAssistant',
      { message: 'What has the room asked so far tonight? Keep it to one line.' },
      { actor: actors.sam },
    )

    await scenario.expectScore('short enough to say out loud', asked.runId, 'readAloud', {
      atLeast: 0.75,
    })

    await scenario.expectScore('backed by the room, not invented', asked.runId, 'grounded', {
      atLeast: 0.8,
    })

    return { answer: asked.answer }
  },
})
