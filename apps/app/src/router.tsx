import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { DefaultErrorPage } from '@/components/DefaultErrorPage'
import { DefaultNotFoundPage } from '@/components/DefaultNotFoundPage'
import { basePath } from '@/lib/env'

export function getRouter() {
  return createRouter({
    routeTree,
    basepath: basePath() || '/',
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultErrorComponent: DefaultErrorPage,
    defaultNotFoundComponent: DefaultNotFoundPage,
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
