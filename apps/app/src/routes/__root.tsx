import { useEffect, useState, type ReactNode } from 'react'
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useRouterState,
  type ErrorComponentProps,
} from '@tanstack/react-router'
import {
  ColorSchemeScript,
  DirectionProvider,
  MantineProvider,
  localStorageColorSchemeManager,
  mantineHtmlProps,
  useDirection,
  type MantineThemeOverride,
} from '@pikku/mantine/core'
import '@mantine/core/styles.css'
import '@mantine/charts/styles.css'
import '@mantine/dates/styles.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PikkuProvider, createPikku } from '@pikku/react'
import { PikkuFetch } from '@project/functions-sdk/pikku/pikku-fetch.gen'
import { PikkuRPC } from '@project/functions-sdk/pikku/pikku-rpc.gen'
import { PikkuRealtime } from '@project/functions-sdk/pikku/realtime.gen'
import {
  activeColorScheme,
  activeId,
  activeTheme,
  buildMantineTheme,
  cssVariablesResolver,
  googleFontsHref,
  themeColorSchemes,
  themes,
  type ColorScheme,
  type Theme,
} from '@project/mantine-themes'
import { defaultLocale, localeDir, supportedLocales, setActiveLocale } from '@/i18n/config'
import { appMeta } from '@/app-meta'
import { apiUrl } from '@/lib/env'
import { registerAnalyticsClickListener } from '@/__fabric_analytics__/analytics-click'
import { recordEvent } from '@/__fabric_analytics__/analytics'
import { PreferencesContext } from '@/contexts/preferences'
import { DefaultErrorPage } from '@/components/DefaultErrorPage'
import { DefaultNotFoundPage } from '@/components/DefaultNotFoundPage'

const LOCALE_KEY = 'app-locale'
const THEME_KEY = 'app-theme'
const COLOR_SCHEME_KEY = 'app-color-scheme'
const THEME_SAVED_ACTIVE_KEY = 'app-theme-saved-active'

const fontsHref = googleFontsHref()

const colorSchemeManager = localStorageColorSchemeManager({ key: COLOR_SCHEME_KEY })

function DirectionSync({ locale }: { locale: string }) {
  const { setDirection } = useDirection()
  useEffect(() => {
    setDirection(localeDir(locale))
  }, [locale, setDirection])
  return null
}

export const Route = createRootRoute({
  head: () => ({ meta: appMeta }),
  notFoundComponent: DefaultNotFoundPage,
  errorComponent: (props: ErrorComponentProps) => (
    <RootDocument>
      <DefaultErrorPage {...props} />
    </RootDocument>
  ),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdRaw] = useState(activeId)
  const [locale, setLocaleRaw] = useState<string>(defaultLocale)
  const [previewTheme, setPreviewTheme] = useState<MantineThemeOverride | null>(null)
  const [previewScheme, setPreviewScheme] = useState<ColorScheme | null>(null)

  const effectiveTheme = previewTheme ?? themes[themeId] ?? activeTheme
  const defaultScheme: ColorScheme = themeColorSchemes[themeId] ?? activeColorScheme

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY)
    const savedAgainst = localStorage.getItem(THEME_SAVED_ACTIVE_KEY)
    if (savedTheme && themes[savedTheme] && savedAgainst === activeId) {
      // oxlint-disable-next-line react/set-state-in-effect -- SSR cannot read localStorage
      setThemeIdRaw(savedTheme)
    } else if (savedTheme) {
      localStorage.removeItem(THEME_KEY)
      localStorage.removeItem(THEME_SAVED_ACTIVE_KEY)
    }

    const savedLocale = localStorage.getItem(LOCALE_KEY)
    if (
      savedLocale &&
      supportedLocales.includes(savedLocale as (typeof supportedLocales)[number])
    ) {
      setLocaleRaw(savedLocale)
      setActiveLocale(savedLocale as (typeof supportedLocales)[number])
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = localeDir(locale)
  }, [locale])

  useEffect(() => registerAnalyticsClickListener(), [])

  const routeId = useRouterState({
    select: (state) => state.matches.at(-1)?.routeId ?? state.location.pathname,
  })
  useEffect(() => {
    recordEvent('page_viewed', { path: routeId })
  }, [routeId])

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data
      if (data?.source !== 'fabric-console' || data.type !== 'set-theme') return
      try {
        const spec = (data.theme ?? data.palette) as Theme | null
        setPreviewTheme(spec ? buildMantineTheme(spec) : null)
        setPreviewScheme(spec?.structure?.defaultColorScheme ?? null)
      } catch (err) {
        console.warn('[mantine-themes] ignoring bad theme payload', err)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  const setLocale = (next: string) => {
    localStorage.setItem(LOCALE_KEY, next)
    setLocaleRaw(next)
    setActiveLocale(next as (typeof supportedLocales)[number])
  }

  const setThemeId = (next: string) => {
    localStorage.setItem(THEME_KEY, next)
    localStorage.setItem(THEME_SAVED_ACTIVE_KEY, activeId)
    setThemeIdRaw(next)
    setPreviewTheme(null)
    setPreviewScheme(null)
  }

  const [queryClient] = useState(() => new QueryClient())
  const [pikku] = useState(() =>
    createPikku(PikkuFetch, PikkuRPC, PikkuRealtime, {
      serverUrl: apiUrl(),
      credentials: 'include',
    }),
  )

  return (
    <html lang={locale} dir={localeDir(locale)} {...mantineHtmlProps}>
      <head>
        <HeadContent />
        <ColorSchemeScript
          defaultColorScheme={activeColorScheme}
          localStorageKey={COLOR_SCHEME_KEY}
        />
        <link
          rel="icon"
          media="(prefers-color-scheme: light)"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='10' fill='%2318181b'/%3E%3Cpath d='M10 12h12M10 16h12M10 20h7' stroke='white' stroke-width='2.6' stroke-linecap='round'/%3E%3C/svg%3E"
        />
        <link
          rel="icon"
          media="(prefers-color-scheme: dark)"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='10' fill='%23fafafa'/%3E%3Cpath d='M10 12h12M10 16h12M10 20h7' stroke='%2318181b' stroke-width='2.6' stroke-linecap='round'/%3E%3C/svg%3E"
        />
        {fontsHref && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
            <link rel="stylesheet" href={fontsHref} />
          </>
        )}
      </head>
      <body>
        <DirectionProvider initialDirection={localeDir(locale)}>
          <MantineProvider
            theme={effectiveTheme}
            cssVariablesResolver={cssVariablesResolver}
            colorSchemeManager={colorSchemeManager}
            defaultColorScheme={defaultScheme}
            forceColorScheme={previewScheme && previewScheme !== 'auto' ? previewScheme : undefined}
          >
            <DirectionSync locale={locale} />
            <PreferencesContext.Provider value={{ locale, themeId, setLocale, setThemeId }}>
              <QueryClientProvider client={queryClient}>
                <PikkuProvider pikku={pikku}>{children}</PikkuProvider>
              </QueryClientProvider>
            </PreferencesContext.Provider>
          </MantineProvider>
        </DirectionProvider>
        <Scripts />
      </body>
    </html>
  )
}
