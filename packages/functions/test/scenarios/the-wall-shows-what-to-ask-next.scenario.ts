import { pikkuScenario } from '#pikku/scenarios'

const BACKPRESSURE = 'How do streams handle backpressure?'
const WORKERS = 'When is a worker thread worth the overhead?'
const PRIYA_DEVICE = 'scenario-device-priya-stage'
const MARCO_DEVICE = 'scenario-device-marco-stage'

export const theWallShowsWhatToAskNextScenario = pikkuScenario<
  void,
  { talkTitle: string; shown: number }
>({
  title: 'The wall shows what to ask next',
  description: 'The projected view leads with the most-wanted question for the current talk',
  tags: ['scenario', 'stage'],
  func: async (_services, _data, { scenario, actors }) => {
    if (!actors?.priya || !actors?.marco) {
      throw new Error('This scenario needs the priya and marco actors.')
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
    await scenario.do(
      'has asked about worker threads',
      'askQuestion',
      { body: WORKERS, authorName: 'Marco', attendeeId: MARCO_DEVICE },
      { actor: actors.marco },
    )
    await scenario.do(
      'has upvoted the backpressure one',
      'upvoteQuestion',
      { questionId: asked.id, attendeeId: MARCO_DEVICE },
      { actor: actors.marco },
    )

    const wall = await scenario.then(
      'sees the wall lead with the backpressure question, under the talk',
      'theWallShows',
      {
        talkTitle: 'Vibe coding is the easy part',
        topQuestion: BACKPRESSURE,
        atMost: 3,
      },
      { actor: actors.priya },
    )

    return { talkTitle: wall.talkTitle, shown: wall.shown }
  },
})
