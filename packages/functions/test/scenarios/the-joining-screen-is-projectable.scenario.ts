import { pikkuScenario } from '#pikku/scenarios'
import { copy } from '../lib/copy.js'

export const theJoiningScreenIsProjectableScenario = pikkuScenario<void, { path: string }>({
  title: 'The joining screen is projectable',
  description: 'The QR screen shows a scannable code and the address in words',
  tags: ['scenario', 'stage'],
  func: async (_services, _data, { scenario, actors }) => {
    if (!actors?.priya) {
      throw new Error('This scenario needs the priya actor.')
    }

    const opened = await scenario.when(
      'projects the QR screen',
      'opensPage',
      { path: '/app/qr' },
      { actor: actors.priya },
    )

    await scenario.then(
      'sees the room invited in',
      'seesText',
      { text: copy('qr__title') },
      {
        actor: actors.priya,
      },
    )
    await scenario.then(
      'sees what to do with the code',
      'seesText',
      { text: 'Point a camera at this' },
      { actor: actors.priya },
    )

    return { path: opened.pathname }
  },
})
