import { z } from 'zod'
import { pikkuScenarioStep } from '#pikku/scenarios'
import {
  ControlInput,
  addressesOnScreen,
  currentPath,
  selectorFor,
  session,
  underlying,
} from '../lib/browser-vocabulary.js'

export const ClicksInput = z.object(ControlInput)

export const ClicksOutput = z.object({
  testId: z.string(),
  pathname: z.string(),
})

export const clicks = pikkuScenarioStep({
  name: 'clicks',
  description: 'clicks a control by its testid',
  template: 'clicks {testId}',
  input: ClicksInput,
  output: ClicksOutput,
  browser: async (_services, input, { browser }) => {
    const actor = session(browser)
    try {
      await actor.locate(selectorFor(input)).click()
    } catch (error) {
      throw new Error(
        `Could not click \`${input.testId}\`${input.within ? ` within \`${input.within}\`` : ''}. ` +
          `${await addressesOnScreen(actor)} ` +
          `If several matched, the key is on more than one control at once — scope it with ` +
          `\`within\` (a component's kebab-cased name) or \`containing\` (text in its row). ` +
          `Underlying: ${underlying(error)}`,
      )
    }
    return { testId: input.testId, pathname: currentPath(actor) }
  },
})
