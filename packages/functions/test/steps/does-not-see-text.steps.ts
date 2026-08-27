import { z } from 'zod'
import { pikkuScenarioStep } from '#pikku/scenarios'
import { session } from '../lib/browser-vocabulary.js'

export const DoesNotSeeTextInput = z.object({
  text: z.string(),
})

export const DoesNotSeeTextOutput = z.object({
  text: z.string(),
})

export const doesNotSeeText = pikkuScenarioStep({
  name: 'doesNotSeeText',
  description: 'asserts text is absent from the current page',
  template: 'does not see {text}',
  input: DoesNotSeeTextInput,
  output: DoesNotSeeTextOutput,
  browser: async (_services, { text }, { browser }) => {
    const actor = session(browser)
    const found = await actor.page.getByText(text, { exact: false }).count()
    if (found > 0) {
      throw new Error(
        `Expected "${text}" to be absent, but it appears ${found} time(s) on ${actor.page.url()}.`,
      )
    }
    return { text }
  },
})
