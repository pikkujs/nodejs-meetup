import { z } from 'zod'
import { pikkuScenarioStep } from '#pikku/scenarios'
import { currentPath, session } from '../lib/browser-vocabulary.js'

export const OpensPageInput = z.object({
  path: z.string(),
})

export const OpensPageOutput = z.object({
  pathname: z.string(),
  status: z.number().nullable(),
})

export const opensPage = pikkuScenarioStep({
  name: 'opensPage',
  description: 'opens an app page as the signed-in actor',
  template: 'opens {path}',
  input: OpensPageInput,
  output: OpensPageOutput,
  browser: async (_services, { path }, { browser }) => {
    const actor = session(browser)
    const status = await actor.gotoApp(path)
    return { pathname: currentPath(actor, path), status }
  },
})
