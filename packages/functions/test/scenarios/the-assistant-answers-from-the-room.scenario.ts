import { pikkuScenario } from '#pikku/scenarios'

const PRIYA_DEVICE = 'scenario-priya-phone'
const BACKPRESSURE = 'How do you actually apply backpressure across a stream pipeline?'

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
      'has asked about backpressure',
      'askQuestion',
      { body: BACKPRESSURE, authorName: 'Priya', attendeeId: PRIYA_DEVICE },
      { actor: actors.priya },
    )

    const asked = await scenario.when(
      'asks for the room in one line',
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
