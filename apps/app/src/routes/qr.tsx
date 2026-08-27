import { createFileRoute } from '@tanstack/react-router'
import { QrPage } from '@/pages/QrPage'

/**
 * The one route that breaks the `/app` convention, and it breaks it on purpose.
 *
 * This URL is typed by a person standing at a lectern with a room waiting, on a
 * laptop that is already mirrored to the projector. `/qr` is four characters and
 * `/app/qr` is eight, and the eight include the slash that is easiest to fumble.
 * Same reasoning as `/` redirecting to the schedule in index.tsx: the character
 * count of a URL read or typed in front of people is a real cost.
 *
 * It renders the page rather than redirecting to `/app/qr`, so the short URL is
 * also what stays in the address bar — a redirect would put the long one back on
 * screen, which is exactly what this exists to avoid. `/app/qr` still works.
 *
 * `ssr: false` because QrPage derives the join URL from `window.location`.
 */
export const Route = createFileRoute('/qr')({
  ssr: false,
  component: QrPage,
})
