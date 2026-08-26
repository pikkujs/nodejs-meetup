import { pikkuScenario } from '#pikku/scenarios'

const MARCO_DEVICE = 'scenario-device-marco-lightning'
const PRIYA_DEVICE = 'scenario-device-priya-lightning'

/**
 * Milestone 04 — knowledge/milestones/04-the-lightning-list.md.
 *
 *   When 'marco' signs up to talk about bun test runners
 *   Then his name is on the lightning list in the order he signed up
 *
 *   Given 'marco' has signed up for a lightning talk
 *   Then 'priya' is not offered a way to withdraw his slot
 *   And 'marco' can withdraw his own
 *
 * Both gherkin scenarios in one ladder, because the second's Given IS the first's
 * Then — splitting them would mean signing Marco up twice against a UNIQUE constraint
 * to prove one thing.
 *
 * "Priya is not offered a way to withdraw his slot" is asserted as `isYours: false` on
 * the row she reads, not as a missing button. The button's absence follows from the
 * flag; the flag is what a curious person with the network tab open actually meets.
 */
export const anyoneCanSignUpForALightningTalkScenario = pikkuScenario<void, { position: number }>({
  title: 'Anyone can put their name down, and take it back',
  description: 'The lightning list is ordered by sign-up and owned by the device that made it',
  tags: ['scenario', 'lightning'],
  func: async (_services, _data, { scenario, actors }) => {
    if (!actors?.priya || !actors?.marco) {
      throw new Error('This scenario needs the priya and marco actors.')
    }

    await scenario.given('the lightning list is empty', 'theLightningListIsEmpty', {})

    await scenario.do(
      'marco signs up to talk about bun test runners',
      'signUpForLightning',
      { name: 'Marco', topic: 'What bun test runners get right', attendeeId: MARCO_DEVICE },
      { actor: actors.marco },
    )

    const listed = await scenario.then(
      'his name is on the list, and it is his',
      'theLightningListReads',
      { name: 'Marco', position: 1, attendeeId: MARCO_DEVICE, isYours: true, present: true },
      { actor: actors.marco },
    )

    await scenario.then(
      'priya is not offered a way to withdraw it',
      'theLightningListReads',
      { name: 'Marco', position: 1, attendeeId: PRIYA_DEVICE, isYours: false, present: true },
      { actor: actors.priya },
    )

    await scenario.do(
      'marco withdraws his own',
      'withdrawLightningSlot',
      { attendeeId: MARCO_DEVICE },
      { actor: actors.marco },
    )

    await scenario.then(
      'he is off the list',
      'theLightningListReads',
      { name: 'Marco', present: false, attendeeId: MARCO_DEVICE },
      { actor: actors.marco },
    )

    return { position: listed.position }
  },
})
