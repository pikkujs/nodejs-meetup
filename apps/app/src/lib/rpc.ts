import { PikkuRPC } from '@project/functions-sdk/pikku/pikku-rpc.gen'
import { apiUrl } from './env'

let client: PikkuRPC | null = null

export function rpc(): PikkuRPC {
  if (!client) {
    client = new PikkuRPC()
    client.setServerUrl(apiUrl())
  }
  return client
}

export function isUnauthorized(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false
  const { status, message } = error as { status?: number; message?: string }
  return status === 401 || (status === 403 && message === 'Authentication required')
}
