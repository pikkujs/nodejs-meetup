import { z } from 'zod'
import type { ActorSession } from '@pikku/playwright'

export const session = (browser: unknown) => browser as ActorSession

export const ControlInput = {
  testId: z.string(),
  within: z.string().optional(),
  containing: z.string().optional(),
}

export type Control = {
  testId: string
  within?: string
  containing?: string
}

export const selectorFor = ({ testId, within, containing }: Control) => ({
  testId,
  ...(containing ? { containing } : {}),
  ...(within ? { within: { testId: within } } : {}),
})

export async function addressesOnScreen(actor: ActorSession): Promise<string> {
  try {
    const ids: string[] = await actor.page.evaluate(() =>
      Array.from(document.querySelectorAll('[data-testid]'))
        .filter((node) => (node as HTMLElement).offsetParent !== null)
        .map((node) => node.getAttribute('data-testid') ?? '')
        .filter(Boolean),
    )
    const unique = [...new Set(ids)].slice(0, 25)
    return unique.length
      ? `The page currently offers: ${unique.join(', ')}.`
      : `The page offers no data-testid at all, which usually means the app was built without the pikku:testids plugin.`
  } catch {
    return ''
  }
}

export const underlying = (error: unknown) =>
  error instanceof Error ? error.message.split('\n')[0] : String(error)

export function currentPath(actor: ActorSession, fallback = ''): string {
  try {
    return new URL(actor.page.url()).pathname
  } catch {
    return fallback
  }
}

export const normalisePath = (path: string) => path.replace(/\/+$/, '') || '/'
