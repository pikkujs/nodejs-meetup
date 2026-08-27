import { pikkuScenario } from '#pikku/scenarios'
import { copy } from '../lib/copy.js'

export const theRoomSeesWhatIsOnNowScenario = pikkuScenario<void, { path: string }>({
  title: 'The room sees what is on now',
  description: 'The schedule pins the current slot above the rest of the evening',
  tags: ['scenario', 'schedule'],
  func: async (_services, _data, { scenario, actors }) => {
    if (!actors?.priya) {
      throw new Error('This scenario needs the priya actor — run it via `pikku scenario run`.')
    }

    await scenario.given('the evening is at talk one', 'theCurrentSlotIs', {
      slotId: 'slot-talk-1',
    })

    const opened = await scenario.when(
      'opens the app',
      'opensPage',
      { path: '/app' },
      {
        actor: actors.priya,
      },
    )

    await scenario.then(
      'sees the evening is on talk one',
      'seesText',
      { text: copy('tonight__now') },
      {
        actor: actors.priya,
      },
    )
    await scenario.then(
      'sees which talk that is',
      'seesText',
      { text: 'Vibe coding is the easy part' },
      { actor: actors.priya },
    )
    await scenario.then(
      'sees a later slot with its time',
      'seesText',
      { text: '20:00' },
      { actor: actors.priya },
    )

    return { path: opened.pathname }
  },
})
