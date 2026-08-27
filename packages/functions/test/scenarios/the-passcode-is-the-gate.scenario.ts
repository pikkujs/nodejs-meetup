import { pikkuScenario } from '#pikku/scenarios'

export const thePasscodeIsTheGateScenario = pikkuScenario<void, { status: number }>({
  title: 'The passcode is the gate, not the screen',
  description: 'An attendee with a session cannot advance the schedule',
  tags: ['scenario', 'organiser', 'security'],
  func: async (_services, _data, { scenario, actors }) => {
    if (!actors?.priya) {
      throw new Error('This scenario needs the priya actor.')
    }

    await scenario.given('the evening is at talk one', 'theCurrentSlotIs', {
      slotId: 'slot-talk-1',
    })

    const refused = await scenario.then(
      'is refused the schedule',
      'isRefused',
      { rpcName: 'advanceSchedule', passcode: 'not-the-passcode' },
      { actor: actors.priya },
    )

    await scenario.then(
      'sees talk one is still the current slot',
      'theRoomIsOn',
      { slotId: 'slot-talk-1' },
      { actor: actors.priya },
    )

    return { status: refused.status }
  },
})
