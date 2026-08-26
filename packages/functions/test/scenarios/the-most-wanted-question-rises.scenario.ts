import { pikkuScenario } from '#pikku/scenarios'

const BACKPRESSURE = 'How do streams handle backpressure?'
const WORKERS = 'When is a worker thread worth the overhead?'

/** Fixed device ids: the board is cleared first, so nothing carries between runs. */
const PRIYA_DEVICE = 'scenario-device-priya'
const MARCO_DEVICE = 'scenario-device-marco'

/**
 * Milestone 03 — knowledge/milestones/03-the-board-sorts-by-votes.md.
 *
 *   Given 'priya' has asked about backpressure
 *   And 'marco' has asked about worker threads
 *   When 'marco' upvotes the backpressure question
 *   Then the backpressure question is at the top of the board
 *
 * Priya asks FIRST and still ends up on top, which is the whole assertion: with the
 * tie-break alone (oldest first) she would be there anyway, so the worker-threads
 * question going second and the vote going to hers is what separates "sorted by votes"
 * from "sorted by time" — two orderings that agree on almost every input.
 */
export const theMostWantedQuestionRisesScenario = pikkuScenario<
  void,
  { top: string; votes: number }
>({
  title: 'The most wanted question rises',
  description: 'The board is ordered by votes, not by when a question was asked',
  tags: ['scenario', 'questions'],
  func: async (_services, _data, { scenario, actors }) => {
    if (!actors?.priya || !actors?.marco) {
      throw new Error('This scenario needs the priya and marco actors.')
    }

    await scenario.given('the evening is at talk one', 'theCurrentSlotIs', {
      slotId: 'slot-talk-1',
    })
    await scenario.given('the board is clear', 'theBoardIsEmpty', { slotId: 'slot-talk-1' })

    const asked = await scenario.do(
      'priya asks about backpressure',
      'askQuestion',
      { body: BACKPRESSURE, authorName: 'Priya', attendeeId: PRIYA_DEVICE },
      { actor: actors.priya },
    )
    await scenario.do(
      'marco asks about worker threads',
      'askQuestion',
      { body: WORKERS, authorName: 'Marco', attendeeId: MARCO_DEVICE },
      { actor: actors.marco },
    )

    await scenario.do(
      'marco upvotes the backpressure question',
      'upvoteQuestion',
      { questionId: asked.id, attendeeId: MARCO_DEVICE },
      { actor: actors.marco },
    )

    const board = await scenario.then(
      'the backpressure question is at the top',
      'theBoardReads',
      { top: BACKPRESSURE, count: 2, attendeeId: MARCO_DEVICE },
      { actor: actors.marco },
    )

    return { top: board.bodies[0] ?? '', votes: board.topVotes }
  },
})
