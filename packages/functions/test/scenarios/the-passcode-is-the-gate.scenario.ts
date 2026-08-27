import { pikkuScenario } from '#pikku/scenarios'

/**
 * Milestone 05, third scenario — the security one.
 *
 *   When 'priya' tries to advance the schedule without the passcode
 *   Then she is refused
 *   And talk one is still the current slot
 *
 * `/app/organiser` is in the navigation for everybody, on purpose
 * (knowledge/decisions/one-app-three-paths.md): hiding a link is presentation
 * pretending to be access control. This is the scenario that makes that stance
 * defensible — Priya has a real session, a device id and the URL, and none of it moves
 * the evening.
 *
 * She attacks the RPC directly rather than through the screen, because that is what an
 * attendee who opens the network tab during a slow talk would do, and the screen's own
 * passcode field is not what stands in the way.
 */
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
