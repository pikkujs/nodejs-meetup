import { pikkuScenario } from '#pikku/scenarios'

/**
 * Milestone 07 — knowledge/milestones/07-the-room-scans-in.md.
 *
 *   When the QR screen is projected
 *   Then the room sees the address to open and a code to scan
 *
 * Through a browser, because the whole artifact is rendered client-side: the code is
 * drawn from `window.location`, so there is no API response that could stand in for
 * this and no server-side answer that would prove anything.
 *
 * The address in text beside the code is not redundancy for its own sake — a phone
 * whose camera will not focus in a dark room still has to be able to join, and
 * somebody will always ask what the URL is.
 */
export const theJoiningScreenIsProjectableScenario = pikkuScenario<void, { path: string }>({
  title: 'The joining screen is projectable',
  description: 'The QR screen shows a scannable code and the address in words',
  tags: ['scenario', 'stage'],
  func: async (_services, _data, { scenario, actors }) => {
    if (!actors?.priya) {
      throw new Error('This scenario needs the priya actor.')
    }

    const opened = await scenario.when(
      'the QR screen is projected',
      'opensPage',
      { path: '/app/qr' },
      { actor: actors.priya },
    )

    await scenario.then('the room is invited in', 'seesText', { text: 'Join in' }, {
      actor: actors.priya,
    })
    await scenario.then(
      'the room is told what to do with the code',
      'seesText',
      { text: 'Point a camera at this' },
      { actor: actors.priya },
    )

    return { path: opened.pathname }
  },
})
