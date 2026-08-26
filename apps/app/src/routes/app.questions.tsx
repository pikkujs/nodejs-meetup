import { createFileRoute } from '@tanstack/react-router'
import { QuestionsPage } from '@/pages/QuestionsPage'

export const Route = createFileRoute('/app/questions')({
  component: QuestionsPage,
})
