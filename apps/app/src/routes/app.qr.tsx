import { createFileRoute } from '@tanstack/react-router'
import { QrPage } from '@/pages/QrPage'

export const Route = createFileRoute('/app/qr')({
  ssr: false,
  component: QrPage,
})
