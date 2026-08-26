import { PikkuRPC } from '@project/functions-sdk/pikku/pikku-rpc.gen'
import { apiUrl } from './env'

/**
 * A PikkuRPC client for code that runs OUTSIDE React — route `beforeLoad` gates, mostly.
 * Components use the usePikku* hooks and the provider in __root.tsx instead.
 *
 * Built lazily on first use: apiUrl() returns a relative placeholder during SSR, so
 * constructing at module scope would bake that in. Every caller is client-only.
 */
let client: PikkuRPC | null = null

export function rpc(): PikkuRPC {
  if (!client) {
    client = new PikkuRPC()
    client.setServerUrl(apiUrl())
  }
  return client
}

/**
 * Is this the server's SIGNED-OUT answer?
 *
 * Pikku answers a missing session with `ForbiddenError('Authentication required')` — a 403,
 * not a 401 — so a status-only check reads it as a real failure and the gate rethrows
 * instead of redirecting. Every signed-out visitor to a gated route got a stack trace where
 * the login form belongs. A 403 carrying any other message IS a genuine permission denial
 * ('Permission denied'), and bouncing a signed-IN user to login on one of those would loop.
 */
export function isUnauthorized(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false
  const { status, message } = error as { status?: number; message?: string }
  return status === 401 || (status === 403 && message === 'Authentication required')
}
