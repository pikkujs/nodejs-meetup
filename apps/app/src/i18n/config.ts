import { useSyncExternalStore } from 'react'
import { locales, baseLocale, overwriteGetLocale } from '../paraglide/runtime.js'
import active from './active.json'

export const supportedLocales = locales
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = (locales as readonly string[]).includes(active.defaultLocale)
  ? (active.defaultLocale as Locale)
  : baseLocale

const RTL_LOCALES = new Set(['ar', 'he', 'fa', 'ur'])
export function localeDir(locale: string = defaultLocale): 'rtl' | 'ltr' {
  return RTL_LOCALES.has(locale.split('-')[0]) ? 'rtl' : 'ltr'
}

export function detectLocale(pathname: string): Locale {
  const segment = pathname.split('/')[1]
  if (supportedLocales.includes(segment as Locale)) return segment as Locale
  if (typeof navigator !== 'undefined') {
    const browserLang = navigator.language?.split('-')[0]
    if (supportedLocales.includes(browserLang as Locale)) return browserLang as Locale
  }
  return defaultLocale
}

let activeLocale: Locale = defaultLocale
const listeners = new Set<() => void>()
overwriteGetLocale(() => activeLocale)

export function setActiveLocale(next: Locale): void {
  if (next === activeLocale) return
  activeLocale = next
  for (const fn of listeners) fn()
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function useLocale(): {
  locale: Locale
  dir: 'ltr' | 'rtl'
  setLocale: (l: Locale) => void
} {
  const locale = useSyncExternalStore<Locale>(
    subscribe,
    () => activeLocale,
    () => activeLocale,
  )
  return { locale, dir: localeDir(locale), setLocale: setActiveLocale }
}

export function isI18nDebug(): boolean {
  if (typeof process !== 'undefined' && process.env?.I18N_DEBUG === '1') return true
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  if (params.has('i18n-debug')) return params.get('i18n-debug') !== '0'
  return window.localStorage?.getItem('i18n-debug') === '1'
}

export function maskI18n(s: string): string {
  return isI18nDebug() ? s.replace(/\S/g, '█') : s
}
