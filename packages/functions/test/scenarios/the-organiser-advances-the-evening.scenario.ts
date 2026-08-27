import { pikkuScenario } from '#pikku/scenarios'

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

    await scenario.given(
      'unlocks the console with the passcode',
      'theOrganiserActs',
      { action: 'checkOrganiserPasscode' },
      { actor: actors.sam },
    )

    await scenario.when(
      'advances the schedule with the passcode',
      'theOrganiserActs',
      { action: 'advanceSchedule' },
      { actor: actors.sam },
    )

    const seen = await scenario.then(
      "sees the room's schedule show the break as now",
      'theRoomIsOn',
      { slotId: 'slot-break' },
      { actor: actors.priya },
    )

    return { nowOn: seen.title }
  },
})
