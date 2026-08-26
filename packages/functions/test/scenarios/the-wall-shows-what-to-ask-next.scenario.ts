import { pikkuScenario } from '#pikku/scenarios'

const BACKPRESSURE = 'How do streams handle backpressure?'
const WORKERS = 'When is a worker thread worth the overhead?'
const PRIYA_DEVICE = 'scenario-device-priya-stage'
const MARCO_DEVICE = 'scenario-device-marco-stage'

/**
 * Milestone 06 — knowledge/milestones/06-the-big-screen.md.
 *
 *   Given talk one is the current slot
 *   And 'priya' has asked about backpressure
 *   And 'marco' has asked about worker threads and upvoted the backpressure one
 *   When the stage view is projected
 *   Then the backpressure question is first on the wall
 *   And the current talk's title is on the wall
 *
 * The wall is read through `getStageView` — the single call the projector makes — so
 * this proves the thing the room sees rather than reassembling it from the board. The
 * three-question cap is asserted inside the step, because a fourth question appearing
 * on a projection is a design failure that no amount of correct data prevents.
 */
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
      'priya has asked about backpressure',
      'askQuestion',
      { body: BACKPRESSURE, authorName: 'Priya', attendeeId: PRIYA_DEVICE },
      { actor: actors.priya },
    )
    await scenario.do(
      'marco has asked about worker threads',
      'askQuestion',
      { body: WORKERS, authorName: 'Marco', attendeeId: MARCO_DEVICE },
      { actor: actors.marco },
    )
    await scenario.do(
      'marco has upvoted the backpressure one',
      'upvoteQuestion',
      { questionId: asked.id, attendeeId: MARCO_DEVICE },
      { actor: actors.marco },
    )

    const wall = await scenario.then(
      'the wall leads with the backpressure question, under the talk',
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
