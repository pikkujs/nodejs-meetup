import { createFileRoute } from '@tanstack/react-router'
import { OrganiserPage } from '@/pages/OrganiserPage'

export const Route = createFileRoute('/app/organiser')({
  component: OrganiserPage,
})
