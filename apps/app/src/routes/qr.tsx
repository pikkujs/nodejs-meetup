import { createFileRoute } from '@tanstack/react-router'
import { QrPage } from '@/pages/QrPage'

/**
 * The projector poster, on the shortest URL the app has.
 *
 * Typed at a lectern in front of a room, so `/qr` rather than `/app/qr`. This is
 * the full-bleed variant with no shell — `/app/qr` is the same code inside the
 * nav, for the phone in the organiser's hand.
 *
 * `ssr: false` because QrPage derives the join URL from `window.location`.
 */
export const Route = createFileRoute('/qr')({
  ssr: false,
  component: () => <QrPage projected />,
})
