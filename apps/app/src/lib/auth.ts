import { createAuthClient } from 'better-auth/client'
import { apiUrl } from './env'

let _authClient: ReturnType<typeof createAuthClient> | null = null
function authClient() {
  _authClient ??= createAuthClient({ baseURL: `${apiUrl()}/auth` })
  return _authClient
}

export type AuthSession = {
  user?: {
    email?: string | null
    name?: string | null
    image?: string | null
  } | null
  expires?: string
}

export const INVALID_CREDENTIALS = 'INVALID_CREDENTIALS'
export const EMAIL_IN_USE = 'EMAIL_IN_USE'

export async function getAuthSession(): Promise<AuthSession> {
  const { data } = await authClient().getSession()
  if (!data?.user) {
    return {}
  }
  return {
    user: {
      email: data.user.email,
      name: data.user.name ?? null,
      image: data.user.image ?? null,
    },
    expires: data.session?.expiresAt ? new Date(data.session.expiresAt).toISOString() : undefined,
  }
}

export async function signInWithPassword(email: string, password: string, _redirectPath = '/app') {
  const { error } = await authClient().signIn.email({ email, password })
  if (error) {
    throw new Error(INVALID_CREDENTIALS)
  }
}

export async function registerWithPassword(
  email: string,
  password: string,
  options: { name?: string; redirectPath?: string } = {},
) {
  const { error } = await authClient().signUp.email({
    email,
    password,
    name: options.name?.trim() || email.split('@')[0],
  })

  if (error) {
    if (error.status === 422 || /exist|taken/i.test(error.message ?? '')) {
      throw new Error(EMAIL_IN_USE)
    }
    throw new Error('Unable to create account')
  }
}

export type DevActor = { key: string; email: string; name: string; jobTitle: string }
export function devActors(): DevActor[] {
  const raw = import.meta.env.VITE_DEV_ACTORS
  if (!import.meta.env.DEV || typeof raw !== 'string') return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Failed to parse VITE_DEV_ACTORS', error)
    return []
  }
}

export async function signInAsActor(email: string): Promise<void> {
  const secret = import.meta.env.VITE_SCENARIO_ACTOR_SECRET
  if (!secret) throw new Error('Actor sign-in is unavailable')
  const res = await fetch(`${apiUrl()}/auth/sign-in/actor`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, secret }),
  })
  if (!res.ok) throw new Error('Unable to sign in as actor')
}

export async function signInWithGoogle(callbackURL = '/app') {
  const { error } = await authClient().signIn.social({ provider: 'google', callbackURL })
  if (error) {
    throw new Error('Unable to continue with Google')
  }
}

export async function requestPasswordReset(email: string) {
  const { error } = await authClient().requestPasswordReset({
    email,
    redirectTo: `${window.location.origin}/app/auth/reset-password`,
  })
  if (error) {
    throw new Error('Unable to send the reset email')
  }
}

export const RESET_TOKEN_INVALID = 'RESET_TOKEN_INVALID'

export async function resetPassword(newPassword: string, token: string) {
  const { error } = await authClient().resetPassword({ newPassword, token })
  if (error) {
    throw new Error(RESET_TOKEN_INVALID)
  }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const { error } = await authClient().changePassword({ currentPassword, newPassword })
  if (error) {
    throw new Error('Unable to update password')
  }
}

export async function signOut() {
  const { error } = await authClient().signOut()
  if (error) {
    throw new Error('Unable to sign out')
  }
}
