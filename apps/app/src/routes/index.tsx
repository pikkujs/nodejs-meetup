import { createFileRoute, redirect } from '@tanstack/react-router'

/**
 * ROUTE CONVENTION: `/api` is the API, `/app` is the application, and `/` is the
 * marketing homepage. There is no marketing homepage for a meetup that happens
 * tonight — the URL is read off a wall, and every character of it is one more thing
 * to get wrong — so `/` goes straight to the schedule.
 *
 * Redirected at the router level so it runs during SSR and on every navigation,
 * instead of a client-only effect that leaves `/` blank until hydration.
 */
export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({ to: '/app' })
  },
})
