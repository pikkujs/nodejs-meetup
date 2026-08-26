import { createFileRoute } from '@tanstack/react-router'
import { LightningPage } from '@/pages/LightningPage'

export const Route = createFileRoute('/app/lightning')({
  component: LightningPage,
})
