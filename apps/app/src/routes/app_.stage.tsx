import { createFileRoute } from '@tanstack/react-router'
import { StagePage } from '@/pages/StagePage'

export const Route = createFileRoute('/app_/stage')({
  ssr: false,
  component: StagePage,
})
