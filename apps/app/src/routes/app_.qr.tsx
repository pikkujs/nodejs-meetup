import { createFileRoute } from '@tanstack/react-router'
import { QrPage } from '@/pages/QrPage'

/** Outside the shell, like the stage view — see app_.stage.tsx. */
export const Route = createFileRoute('/app_/qr')({
  ssr: false,
  component: QrPage,
})
