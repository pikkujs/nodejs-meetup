import { pikkuScenario } from '#pikku/scenarios'
import { copy } from '../lib/copy.js'

const QUESTION = 'How do streams handle backpressure?'

export const aFirstTimerNamesThemselvesAndAsksScenario = pikkuScenario<void, { asked: string }>({
  title: 'A first-time attendee names themselves and asks',
  description: 'The name is asked for once, at the moment it is needed, and remembered',
  tags: ['scenario', 'questions'],
  func: async (_services, _data, { scenario, actors }) => {
    if (!actors?.priya) {
      throw new Error('This scenario needs the priya actor — run it via `pikku scenario run`.')
    }

    await scenario.given('the evening is at talk one', 'theCurrentSlotIs', {
      slotId: 'slot-talk-1',
    })
    await scenario.given('the board is clear', 'theBoardIsEmpty', { slotId: 'slot-talk-1' })

    await scenario.when(
      'opens the board',
      'opensPage',
      { path: '/app/questions' },
      {
        actor: actors.priya,
      },
    )
    await scenario.when(
      'types the question',
      'fills',
      { testId: 'questions__placeholder', value: QUESTION },
      { actor: actors.priya },
    )
    await scenario.when(
      'posts it',
      'clicks',
      { testId: 'questions__cta' },
      {
        actor: actors.priya,
      },
    )

    await scenario.when(
      'gives a name',
      'fills',
      { testId: 'common__name', value: 'Priya' },
      { actor: actors.priya },
    )
    await scenario.when(
      'confirms it',
      'clicks',
      { testId: 'you__cta' },
      {
        actor: actors.priya,
      },
    )

    await scenario.then(
      'sees the question on the board',
      'seesText',
      { text: QUESTION },
      {
        actor: actors.priya,
      },
    )
    await scenario.then(
      'sees the name on it',
      'seesText',
      { text: 'Priya' },
      {
        actor: actors.priya,
      },
    )

    await scenario.then(
      'reopens the board',
      'opensPage',
      { path: '/app/questions' },
      {
        actor: actors.priya,
      },
    )
    await scenario.then(
      'is not asked for a name again',
      'doesNotSeeText',
      { text: copy('you__title') },
      { actor: actors.priya },
    )

    return { asked: QUESTION }
  },
})
