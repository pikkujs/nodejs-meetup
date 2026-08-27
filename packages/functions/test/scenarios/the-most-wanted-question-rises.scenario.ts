import { pikkuScenario } from '#pikku/scenarios'

const BACKPRESSURE = 'How do streams handle backpressure?'
const WORKERS = 'When is a worker thread worth the overhead?'

const PRIYA_DEVICE = 'scenario-device-priya'
const MARCO_DEVICE = 'scenario-device-marco'

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
      'asks about backpressure',
      'askQuestion',
      { body: BACKPRESSURE, authorName: 'Priya', attendeeId: PRIYA_DEVICE },
      { actor: actors.priya },
    )
    await scenario.do(
      'asks about worker threads',
      'askQuestion',
      { body: WORKERS, authorName: 'Marco', attendeeId: MARCO_DEVICE },
      { actor: actors.marco },
    )

    await scenario.do(
      'upvotes the backpressure question',
      'upvoteQuestion',
      { questionId: asked.id, attendeeId: MARCO_DEVICE },
      { actor: actors.marco },
    )

    const board = await scenario.then(
      'sees the backpressure question at the top',
      'theBoardReads',
      { top: BACKPRESSURE, count: 2, attendeeId: MARCO_DEVICE },
      { actor: actors.marco },
    )

    return { top: board.bodies[0] ?? '', votes: board.topVotes }
  },
})
