import { pikkuScenario } from '#pikku/scenarios'

/**
 * Milestone 01 — knowledge/milestones/01-tonights-schedule.md.
 *
 *   Given tonight's running order is seeded from doors to doors
 *   When 'priya' opens the meetup app
 *   Then she sees the current slot marked Now above the rest of the evening
 *   And she sees every later slot with its time
 *
 * Driven through a browser rather than over the API, because the claim is about what
 * a person standing in the room SEES. `listSchedule` returning the right rows and the
 * page pinning the current one to the top are different facts, and this milestone is
 * the second one.
 */
export const theRoomSeesWhatIsOnNowScenario = pikkuScenario<void, { path: string }>({
  title: 'The room sees what is on now',
  description: 'The schedule pins the current slot above the rest of the evening',
  tags: ['scenario', 'schedule'],
  func: async (_services, _data, { scenario, actors }) => {
    if (!actors?.priya) {
      throw new Error('This scenario needs the priya actor — run it via `pikku scenario run`.')
    }

    await scenario.given('the evening is at talk one', 'theCurrentSlotIs', {
      slotId: 'slot-talk-1',
    })

    const opened = await scenario.when('priya opens the app', 'opensPage', { path: '/app' }, {
      actor: actors.priya,
    })

    // The word and the title together: the badge alone appears on any slot, and the
    // title alone appears whether or not it is pinned.
    await scenario.then('she sees the evening is on talk one', 'seesText', { text: 'Now' }, {
      actor: actors.priya,
    })
    await scenario.then(
      'she sees which talk that is',
      'seesText',
      { text: 'Vibe coding is the easy part' },
      { actor: actors.priya },
    )
    // A later slot, with its time — proof the rest of the evening is on the page and
    // not just the one card.
    await scenario.then(
      'she sees a later slot with its time',
      'seesText',
      { text: '20:00' },
      { actor: actors.priya },
    )

    return { path: opened.pathname }
  },
})
