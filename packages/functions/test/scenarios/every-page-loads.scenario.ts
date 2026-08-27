import { pikkuScenario } from '#pikku/scenarios'

export const everyPageLoadsScenario = pikkuScenario<void, { routes: string[] }>({
  title: 'Every page loads cleanly when signed in',
  description: 'The baseline reliability gate — no page errors for a signed-in user',
  tags: ['scenario', 'pages', 'smoke'],
  func: async (_services, _data, { scenario, actors }) => {
    if (!actors?.priya) {
      throw new Error(
        'everyPageLoadsScenario needs the priya actor — run via `pikku scenario run <environment>`',
      )
    }
    const swept = await scenario.then(
      'loads every page without errors',
      'sweepsAllPages',
      { repoRoot: '.' },
      { actor: actors.priya },
    )
    return { routes: swept.routes }
  },
})
