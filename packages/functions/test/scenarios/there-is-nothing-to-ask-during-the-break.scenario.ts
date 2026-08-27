import { pikkuScenario } from '#pikku/scenarios'

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
