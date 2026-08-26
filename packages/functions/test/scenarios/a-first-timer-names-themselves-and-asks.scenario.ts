import { pikkuScenario } from '#pikku/scenarios'

/** The question this scenario types, distinctive enough to assert on. */
const QUESTION = 'How do streams handle backpressure?'

/**
 * Milestone 02 — knowledge/milestones/02-a-question-for-the-current-talk.md.
 *
 *   Given talk one is the current slot
 *   And 'priya' has never opened the app on this device
 *   When she gives her name once
 *   And she asks how streams handle backpressure
 *   Then her question appears on the board for talk one under her name
 *   And she is not asked for her name again
 *
 * The order matters and is the design: she types the QUESTION first and is asked for a
 * name only at the moment she posts. A name gate on the front door would be easier to
 * test and would be the wrong app — most people open this to read, not to write.
 *
 * "Never opened the app on this device" is free here: the runner opens a fresh browser
 * context per actor, so `localStorage` starts empty exactly as it does for someone who
 * has just walked in.
 */
export const aFirstTimerNamesThemselvesAndAsksScenario = pikkuScenario<void, { asked: string }>({
  title: 'A first-time attendee names themselves and asks',
  description: 'The name is asked for once, at the moment it is needed, and remembered',
  tags: ['scenario', 'questions'],
  func: async (_services, _data, { scenario, actors }) => {
    if (!actors?.priya) {
      throw new Error('This scenario needs the priya actor — run it via `pikku scenario run`.')
    }

    await scenario.given('the evening is at talk one', 'theCurrentSlotIs', {
      slotId: 'slot-talk-1',
    })
    await scenario.given('the board is clear', 'theBoardIsEmpty', { slotId: 'slot-talk-1' })

    await scenario.when(
      'priya opens the board',
      'opensPage',
      { path: '/app/questions' },
      {
        actor: actors.priya,
      },
    )
    await scenario.when(
      'she types her question',
      'fills',
      { testId: 'questions__placeholder', value: QUESTION },
      { actor: actors.priya },
    )
    await scenario.when(
      'she posts it',
      'clicks',
      { testId: 'questions__cta' },
      {
        actor: actors.priya,
      },
    )

    // Only now is she asked who she is.
    await scenario.when(
      'she gives her name',
      'fills',
      { testId: 'common__name', value: 'Priya' },
      { actor: actors.priya },
    )
    await scenario.when(
      'she confirms it',
      'clicks',
      { testId: 'you__cta' },
      {
        actor: actors.priya,
      },
    )

    await scenario.then(
      'her question is on the board',
      'seesText',
      { text: QUESTION },
      {
        actor: actors.priya,
      },
    )
    await scenario.then(
      'it carries her name',
      'seesText',
      { text: 'Priya' },
      {
        actor: actors.priya,
      },
    )

    // The remembering, proven across a full page load rather than a re-render.
    await scenario.then(
      'she reopens the board',
      'opensPage',
      { path: '/app/questions' },
      {
        actor: actors.priya,
      },
    )
    await scenario.then(
      'she is not asked for her name again',
      'doesNotSeeText',
      { text: 'What should we call you?' },
      { actor: actors.priya },
    )

    return { asked: QUESTION }
  },
})
