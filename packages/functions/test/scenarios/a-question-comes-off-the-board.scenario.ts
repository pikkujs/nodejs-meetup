import { pikkuScenario } from '#pikku/scenarios'

const BACKPRESSURE = 'How do streams handle backpressure?'
const PRIYA_DEVICE = 'scenario-device-priya-answered'

/**
 * Milestone 05, second scenario.
 *
 *   Given 'priya' has asked about backpressure
 *   When 'sam' marks it answered
 *   Then it is gone from the board
 *
 * GONE, not greyed out — knowledge/decisions/design/the-board-is-a-queue.md. A board
 * that keeps answered questions is a transcript, and a transcript on a projector wastes
 * the three lines the room can actually read.
 */
export const aQuestionComesOffTheBoardScenario = pikkuScenario<void, { remaining: number }>({
  title: 'A question comes off the board once it is answered',
  description: 'Marking a question answered removes it from the queue',
  tags: ['scenario', 'organiser'],
  func: async (_services, _data, { scenario, actors }) => {
    if (!actors?.sam || !actors?.priya) {
      throw new Error('This scenario needs the sam and priya actors.')
    }

    await scenario.given('the evening is at talk one', 'theCurrentSlotIs', {
      slotId: 'slot-talk-1',
    })
    await scenario.given('the board is clear', 'theBoardIsEmpty', { slotId: 'slot-talk-1' })

    const asked = await scenario.do(
      'has asked about backpressure',
      'askQuestion',
      { body: BACKPRESSURE, authorName: 'Priya', attendeeId: PRIYA_DEVICE },
      { actor: actors.priya },
    )

    await scenario.when(
      'marks it answered',
      'theOrganiserActs',
      { action: 'markQuestionAnswered', questionId: asked.id },
      { actor: actors.sam },
    )

    const board = await scenario.then(
      'no longer sees it on the board',
      'theBoardReads',
      { absent: BACKPRESSURE, count: 0, attendeeId: PRIYA_DEVICE },
      { actor: actors.priya },
    )

    return { remaining: board.bodies.length }
  },
})
