import { pikkuScenario } from '#pikku/scenarios'
import { copy } from '../lib/copy.js'

export const theOrganiserUnlocksAndRunsTheNightScenario = pikkuScenario<void, { path: string }>({
  title: 'The organiser console refuses a wrong passcode',
  description: 'The passcode screen stands between the room and the schedule',
  tags: ['scenario', 'organiser'],
  func: async (_services, _data, { scenario, actors }) => {
    if (!actors?.sam) {
      throw new Error('This scenario needs the sam actor.')
    }

    await scenario.given('the evening is at talk one', 'theCurrentSlotIs', {
      slotId: 'slot-talk-1',
    })

    const opened = await scenario.when(
      'opens the organiser screen',
      'opensPage',
      { path: '/app/organiser' },
      { actor: actors.sam },
    )

    await scenario.then(
      'is asked for the passcode',
      'seesText',
      { text: 'Enter the shared passcode' },
      { actor: actors.sam },
    )
    await scenario.then(
      'does not see the schedule control',
      'doesNotSeeText',
      { text: copy('organiser__advance') },
      { actor: actors.sam },
    )

    await scenario.when(
      'types the wrong passcode',
      'fills',
      { testId: 'organiser__passcode', value: 'not-the-passcode' },
      { actor: actors.sam },
    )
    await scenario.when(
      'tries it',
      'clicks',
      { testId: 'organiser__unlock' },
      {
        actor: actors.sam,
      },
    )

    await scenario.then(
      'is told it is wrong',
      'seesText',
      { text: "That's not the passcode" },
      { actor: actors.sam },
    )
    await scenario.then(
      'sees the screen still locked',
      'doesNotSeeText',
      { text: copy('organiser__advance') },
      { actor: actors.sam },
    )
    await scenario.then(
      'sees the evening has not moved',
      'theRoomIsOn',
      { slotId: 'slot-talk-1' },
      { actor: actors.sam },
    )

    return { path: opened.pathname }
  },
})
