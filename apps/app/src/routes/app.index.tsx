import { createFileRoute } from '@tanstack/react-router'
import { TonightPage } from '@/pages/TonightPage'

export const Route = createFileRoute('/app/')({
  component: TonightPage,
})
