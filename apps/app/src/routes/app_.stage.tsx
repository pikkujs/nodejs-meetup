import { createFileRoute } from '@tanstack/react-router'
import { StagePage } from '@/pages/StagePage'

/**
 * `app_.` — the non-nested segment. Keeps the `/app/stage` URL (one prefix to read
 * out loud) while escaping the app shell entirely: no sidebar, no phone tab bar
 * eating the bottom of a 1080p projection.
 *
 * `ssr: false` because the page derives the join URL from `window.location`.
 */
export const Route = createFileRoute('/app_/stage')({
  ssr: false,
  component: StagePage,
})
