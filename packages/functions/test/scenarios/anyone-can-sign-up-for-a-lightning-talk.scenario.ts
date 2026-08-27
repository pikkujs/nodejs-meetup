import { pikkuScenario } from '#pikku/scenarios'

const MARCO_DEVICE = 'scenario-device-marco-lightning'
const PRIYA_DEVICE = 'scenario-device-priya-lightning'

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
      'signs up to talk about bun test runners',
      'signUpForLightning',
      { name: 'Marco', topic: 'What bun test runners get right', attendeeId: MARCO_DEVICE },
      { actor: actors.marco },
    )

    const listed = await scenario.then(
      'sees the slot on the list as their own',
      'theLightningListReads',
      { name: 'Marco', position: 1, attendeeId: MARCO_DEVICE, isYours: true, present: true },
      { actor: actors.marco },
    )

    await scenario.then(
      'is not offered a way to withdraw it',
      'theLightningListReads',
      { name: 'Marco', position: 1, attendeeId: PRIYA_DEVICE, isYours: false, present: true },
      { actor: actors.priya },
    )

    await scenario.do(
      'withdraws their own',
      'withdrawLightningSlot',
      { attendeeId: MARCO_DEVICE },
      { actor: actors.marco },
    )

    await scenario.then(
      'is off the list',
      'theLightningListReads',
      { name: 'Marco', present: false, attendeeId: MARCO_DEVICE },
      { actor: actors.marco },
    )

    return { position: listed.position }
  },
})
