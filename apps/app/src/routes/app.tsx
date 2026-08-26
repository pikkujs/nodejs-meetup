import { createFileRoute } from '@tanstack/react-router'
import { AppShell } from '@/components/AppShell'

/**
 * The attendee layout. NO `beforeLoad` gate — nobody signs in tonight
 * (knowledge/decisions/security/nobody-signs-in.md), so there is nothing to gate on
 * and no login page to send anyone to.
 *
 * `ssr: false` stays: every screen under here reads the device's name and id out of
 * `localStorage`, which the server cannot see, so a server render would be a
 * guaranteed hydration mismatch on the very first paint.
 */
export const Route = createFileRoute('/app')({
  ssr: false,
  component: AppShell,
})
