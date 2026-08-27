import { pikkuScenario } from '#pikku/scenarios'

export const sessionHealthScenario = pikkuScenario<void, { email: string; userId: string }>({
  title: 'Session health (scenario)',
  tags: ['scenario'],
  func: async ({ logger }, _input, { scenario, actors }) => {
    const [actor] = Object.values(actors ?? {})
    if (!actor) {
      throw new Error(
        'sessionHealthScenario needs at least one run actor — run via `pikku scenario run <environment>`',
      )
    }
    logger.debug('session-health scenario starting')
    const session = await scenario.do(
      'an actor signs in and reads their session',
      'getSession',
      {},
      { actor },
    )
    return { email: session.email, userId: session.userId }
  },
})
