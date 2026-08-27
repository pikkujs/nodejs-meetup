import type { FC } from 'react'
import { ActionIcon, Box, Card, Group, Skeleton, Stack, Text } from '@pikku/mantine/core'
import { asI18n, m } from '@/i18n/messages'
import { useReorderAnimation } from '@/lib/reorder'
import { RollingNumber } from './RollingNumber'

const UpvoteGlyph: FC = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
)

export type BoardQuestion = {
  id: string
  body: string
  authorName: string
  votes: number
  youVoted: boolean
}

export interface QuestionBoardProps {
  questions: BoardQuestion[]
  isPending?: boolean
  interlude?: boolean
  canVote?: boolean
  onUpvote?: (questionId: string) => void
}

export const QuestionBoard: FC<QuestionBoardProps> = ({
  questions,
  isPending = false,
  interlude = false,
  canVote = true,
  onUpvote,
}) => {
  const listRef = useReorderAnimation(questions.map((question) => question.id).join())

  if (isPending) {
    return <Skeleton height={120} radius="lg" />
  }

  if (!interlude && questions.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        {m.questions__empty()}
      </Text>
    )
  }

  return (
    <Stack gap="sm" ref={listRef}>
      {questions.map((question) => (
        <Card key={question.id} data-reorder-key={question.id} withBorder padding="md">
          <Group wrap="nowrap" align="flex-start" gap="md">
            <Stack gap={2} align="center" style={{ flex: 'none', width: 44 }}>
              <ActionIcon
                size="lg"
                radius="md"
                variant={question.youVoted ? 'filled' : 'default'}
                aria-label={question.youVoted ? m.questions__voted() : m.questions__vote()}
                aria-pressed={question.youVoted}
                disabled={question.youVoted || !canVote}
                onClick={() => onUpvote?.(question.id)}
              >
                <UpvoteGlyph />
              </ActionIcon>
              <RollingNumber
                value={question.votes}
                fontSize="var(--mantine-font-size-sm)"
                label={m.questions__votes_label()}
              />
            </Stack>

            <Box style={{ minWidth: 0 }}>
              <Text lh={1.45}>{asI18n(question.body)}</Text>
              <Text fz="xs" c="dimmed" mt={6}>
                {asI18n(question.authorName)}
              </Text>
            </Box>
          </Group>
        </Card>
      ))}
    </Stack>
  )
}
