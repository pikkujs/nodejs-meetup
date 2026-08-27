import { defineVariable } from '@pikku/core/variable'
import { z } from 'zod'
import type { SingletonServices } from '#pikku/function'

export const CorsOriginsSchema = z.string()
export const FrontendUrlSchema = z.string()

defineVariable({
  name: 'corsOrigins',
  displayName: 'Allowed Browser Origins',
  description:
    'Comma-separated list of origins allowed to call this API from a browser, e.g. "https://app.example.com". Also the allowlist the analytics ingest enforces server-side. Unset falls back to FRONTEND_URL plus localhost.',
  variableId: 'CORS_ORIGINS',
  schema: CorsOriginsSchema,
  optional: true,
})

defineVariable({
  name: 'frontendUrl',
  displayName: 'Frontend URL',
  description:
    "This app's own web origin. Used as the single-entry CORS allowlist when CORS_ORIGINS is not set.",
  variableId: 'FRONTEND_URL',
  schema: FrontendUrlSchema,
  optional: true,
})

export async function allowedOrigins(variables: SingletonServices['variables']): Promise<string[]> {
  const configured = await variables.get('CORS_ORIGINS')
  if (configured) {
    return configured
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
  }
  const frontendUrl = await variables.get('FRONTEND_URL')
  return [frontendUrl, 'http://localhost:7104', 'http://127.0.0.1:7104'].filter(
    (origin): origin is string => Boolean(origin),
  )
}
