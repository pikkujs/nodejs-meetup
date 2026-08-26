import { pikkuScenario } from '#pikku/scenarios'

/**
 * Milestone 05 — knowledge/milestones/05-the-organiser-runs-the-night.md.
 *
 *   Given talk one is the current slot
 *   When 'sam' advances the schedule with the passcode
 *   Then the short break is the current slot
 *   And the room's schedule shows the break as Now
 *
 * The last line is why this reads the schedule back as PRIYA. Sam advancing and Sam
 * seeing the result proves a round trip to himself; the thing that matters is that
 * forty other phones moved with him.
 */
export const theOrganiserAdvancesTheEveningScenario = pikkuScenario<void, { nowOn: string }>({
  title: 'The organiser advances the evening',
  description: 'Advancing the schedule moves what the whole room sees',
  tags: ['scenario', 'organiser'],
  func: async (_services, _data, { scenario, actors }) => {
    if (!actors?.sam || !actors?.priya) {
      throw new Error('This scenario needs the sam and priya actors.')
    }

    await scenario.given('the evening is at talk one', 'theCurrentSlotIs', {
      slotId: 'slot-talk-1',
    })

    // The unlock is a step of its own because it is a real one: nobody advances the
    // evening without first getting past this screen, and it is the only call that
    // exists purely to answer "is this the passcode?".
    await scenario.given(
      'sam unlocks the console with the passcode',
      'theOrganiserActs',
      { action: 'checkOrganiserPasscode' },
      { actor: actors.sam },
    )

    await scenario.when(
      'sam advances the schedule with the passcode',
      'theOrganiserActs',
      { action: 'advanceSchedule' },
      { actor: actors.sam },
    )

    const seen = await scenario.then(
      "the room's schedule shows the break as now",
      'theRoomIsOn',
      { slotId: 'slot-break' },
      { actor: actors.priya },
    )

    return { nowOn: seen.title }
  },
})
