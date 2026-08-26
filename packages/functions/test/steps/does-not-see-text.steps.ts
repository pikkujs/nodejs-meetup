import { z } from 'zod'
import { pikkuScenarioStep } from '#pikku/scenarios'
import { session } from '../lib/browser-vocabulary.js'

export const DoesNotSeeTextInput = z.object({
  text: z.string(),
})

export const DoesNotSeeTextOutput = z.object({
  text: z.string(),
})

/**
 * Assert a string is NOT on the page.
 *
 * The mirror of `seesText`, and it cannot be built out of it: waiting for absence is
 * a different operation from waiting for presence, and "the assertion timed out" is
 * the PASS here, which is not something a negated wait can express honestly.
 *
 * `count() === 0` reads the page as it stands, so the caller must already have waited
 * for the state it is asserting about — every use here follows a `seesText` on
 * something that appears at the same moment.
 */
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
