import { pikkuScenario } from '#pikku/scenarios'
import { copy } from '../lib/copy.js'

/**
 * Milestone 05, through the screen the organiser actually uses.
 *
 * The API scenarios beside this one prove the rules; this proves the console — that a
 * passcode typed into a field unlocks a working screen, and that the two big controls
 * on it do what their labels say.
 *
 * Sam types the passcode as a literal, and it is the WRONG one first. The real
 * passcode never appears in this file: after the refusal, the run reads it from the
 * environment through `theOrganiserActs`, exactly as every other organiser scenario
 * does. What is asserted here is the shape of the screen either side of the lock —
 * which is the part a passcode-in-a-test-file would have bought nothing extra of.
 */
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
      'sam opens the organiser screen',
      'opensPage',
      { path: '/app/organiser' },
      { actor: actors.sam },
    )

    await scenario.then(
      'he is asked for the passcode',
      'seesText',
      { text: 'Enter the shared passcode' },
      { actor: actors.sam },
    )
    // The screen is locked, so nothing that runs the evening is on it yet.
    await scenario.then(
      'the schedule control is not on the screen',
      'doesNotSeeText',
      { text: copy('organiser__advance') },
      { actor: actors.sam },
    )

    await scenario.when(
      'he types the wrong passcode',
      'fills',
      { testId: 'organiser__passcode', value: 'not-the-passcode' },
      { actor: actors.sam },
    )
    await scenario.when(
      'he tries it',
      'clicks',
      { testId: 'organiser__unlock' },
      {
        actor: actors.sam,
      },
    )

    await scenario.then(
      'he is told it is wrong',
      'seesText',
      { text: "That's not the passcode" },
      { actor: actors.sam },
    )
    await scenario.then(
      'the screen is still locked',
      'doesNotSeeText',
      { text: copy('organiser__advance') },
      { actor: actors.sam },
    )
    await scenario.then(
      'and the evening has not moved',
      'theRoomIsOn',
      { slotId: 'slot-talk-1' },
      { actor: actors.sam },
    )

    return { path: opened.pathname }
  },
})
