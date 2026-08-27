import { pikkuScenario } from '#pikku/scenarios'

/**
 * Milestone 02, second scenario.
 *
 *   Given the break is the current slot
 *   When 'marco' opens the Q&A board
 *   Then he is told what is happening instead of being offered a composer
 *
 * The interesting half is the ABSENCE. A composer that posts into an interlude has to
 * be refused by the server, and a refusal after typing is a worse experience than not
 * being offered the box — so the board removes the composer and says why, and this
 * asserts both halves rather than trusting the first.
 */
export const thereIsNothingToAskDuringTheBreakScenario = pikkuScenario<void, { slot: string }>({
  title: 'There is nothing to ask during the break',
  description: 'An interlude closes the composer and says so',
  tags: ['scenario', 'questions'],
  func: async (_services, _data, { scenario, actors }) => {
    if (!actors?.marco) {
      throw new Error('This scenario needs the marco actor — run it via `pikku scenario run`.')
    }

    const slot = await scenario.given('the evening is at the break', 'theCurrentSlotIs', {
      slotId: 'slot-break',
    })

    await scenario.when(
      'opens the board',
      'opensPage',
      { path: '/app/questions' },
      {
        actor: actors.marco,
      },
    )

    await scenario.then(
      'is told what is happening',
      'seesText',
      { text: 'Nothing is on stage right now' },
      { actor: actors.marco },
    )
    await scenario.then(
      'is not offered a composer',
      'doesNotSeeText',
      { text: 'Ask the speaker something' },
      { actor: actors.marco },
    )

    return { slot: slot.slotId }
  },
})
