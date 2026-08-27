import { z } from 'zod'
import { pikkuScenarioStep } from '#pikku/scenarios'
import { normalisePath, session } from '../lib/browser-vocabulary.js'

export const RestsOnPathInput = z.object({
  path: z.string(),
})

export const RestsOnPathOutput = z.object({
  pathname: z.string(),
})

export const restsOnPath = pikkuScenarioStep({
  name: 'restsOnPath',
  description: 'asserts the browser came to rest on an app path',
  template: 'is on {path}',
  input: RestsOnPathInput,
  output: RestsOnPathOutput,
  browser: async (_services, { path }, { browser }) => {
    const actor = session(browser)
    const pathname = new URL(actor.page.url()).pathname
    if (normalisePath(pathname) !== normalisePath(path)) {
      throw new Error(
        `Expected to be on ${path}, but the browser rests on ${pathname}. ` +
          `A bounce to a login route means the session cookie did not carry, or the route guard rejected it.`,
      )
    }
    return { pathname }
  },
})
