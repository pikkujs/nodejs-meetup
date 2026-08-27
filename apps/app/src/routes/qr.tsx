import { createFileRoute } from '@tanstack/react-router'
import { QrPage } from '@/pages/QrPage'

export const Route = createFileRoute('/qr')({
  ssr: false,
  component: () => <QrPage projected />,
})
