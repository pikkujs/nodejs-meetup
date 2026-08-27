import { m as _m } from '../paraglide/messages.js'
import type { I18nString } from '@pikku/react'
import { maskI18n } from './config.js'

type BrandReturn<T> = T extends (...args: infer A) => unknown ? (...args: A) => I18nString : T
type Branded<T> = { [K in keyof T]: BrandReturn<T[K]> }

const _raw = _m as unknown as Record<string, (args?: Record<string, unknown>) => string>
const _wrapped: Record<string, unknown> = {}
for (const key of Object.keys(_raw)) {
  const fn = _raw[key]
  _wrapped[key] =
    typeof fn === 'function'
      ? (...args: unknown[]) => maskI18n((fn as (...a: unknown[]) => string)(...args))
      : fn
}

export const m = _wrapped as unknown as Branded<typeof _m>

export { asI18n } from '@pikku/react'
