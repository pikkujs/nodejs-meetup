import { z } from 'zod'
import { staticRoutes, sweepAllPages } from '@pikku/playwright'
import { pikkuScenarioStep } from '#pikku/scenarios'
import { session } from '../lib/browser-vocabulary.js'

export const SweepsAllPagesInput = z.object({
  repoRoot: z.string().default('.'),
})

export const SweepsAllPagesOutput = z.object({
  routes: z.array(z.string()),
})

export const sweepsAllPages = pikkuScenarioStep({
  name: 'sweepsAllPages',
  description: 'visits every static route and fails on any runtime error',
  template: 'every page loads without errors',
  input: SweepsAllPagesInput,
  output: SweepsAllPagesOutput,
  browser: async (_services, { repoRoot }, { browser }) => {
    const actor = session(browser)
    await actor.waitForServerReady()
    await sweepAllPages(actor, repoRoot)
    return { routes: staticRoutes(repoRoot) }
  },
})
