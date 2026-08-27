import { pikkuScenario } from '#pikku/scenarios'

const BACKPRESSURE = 'How do streams handle backpressure?'
const MARCO_DEVICE = 'scenario-device-marco-repeat'

/**
 * Milestone 03, second scenario.
 *
 *   Given 'marco' has upvoted the backpressure question
 *   When he tries to upvote it a second time
 *   Then he is refused
 *   And the question still has one vote
 *
 * Worth its own scenario because the device id is a CLAIM, not a credential
 * (knowledge/decisions/security/nobody-signs-in.md) — the honest defence against
 * ballot-stuffing is a primary key, and this is the test that the primary key is
 * actually doing that job rather than the UI hiding the button.
 */
export const onePersonOneVoteScenario = pikkuScenario<void, { votes: number }>({
  title: 'One person, one vote',
  description: 'A second vote from the same device is refused and changes nothing',
  tags: ['scenario', 'questions'],
  func: async (_services, _data, { scenario, actors }) => {
    if (!actors?.marco) {
      throw new Error('This scenario needs the marco actor.')
    }

    await scenario.given('the evening is at talk one', 'theCurrentSlotIs', {
      slotId: 'slot-talk-1',
    })
    await scenario.given('the board is clear', 'theBoardIsEmpty', { slotId: 'slot-talk-1' })

    const asked = await scenario.do(
      'asks about backpressure',
      'askQuestion',
      { body: BACKPRESSURE, authorName: 'Marco', attendeeId: MARCO_DEVICE },
      { actor: actors.marco },
    )
    await scenario.do(
      'has upvoted it',
      'upvoteQuestion',
      { questionId: asked.id, attendeeId: MARCO_DEVICE },
      { actor: actors.marco },
    )

    const refused = await scenario.then(
      'is refused a second vote, and the count holds',
      'theVoteIsRefused',
      { questionId: asked.id, attendeeId: MARCO_DEVICE, votes: 1 },
      { actor: actors.marco },
    )

    return { votes: refused.votes }
  },
})
