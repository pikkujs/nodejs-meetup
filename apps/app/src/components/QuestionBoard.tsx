import type { FC } from 'react'
import { ActionIcon, Box, Card, Group, Skeleton, Stack, Text } from '@pikku/mantine/core'
import { asI18n, m } from '@/i18n/messages'
import { useReorderAnimation } from '@/lib/reorder'
import { RollingNumber } from './RollingNumber'

/** A chevron, not a heart: this is a queue position, not a like. */
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
  /** The first load, before any board exists to draw. */
  isPending?: boolean
  /** During an interlude there is nothing to ask about, so the prompt to ask is wrong. */
  interlude?: boolean
  /** A phone with no attendee id yet cannot vote — the control says so rather than failing. */
  canVote?: boolean
  onUpvote?: (questionId: string) => void
}

/**
 * The Q&A board: the ranked list, and the one control on it.
 *
 * Presentational on purpose — the page owns the `listQuestions` poll and the
 * `upvoteQuestion` mutation and hands the result down, which is what lets the
 * Design tab render every state of this widget without a server. The FLIP
 * animation lives here because it belongs to the list, and re-runs on the ORDER
 * changing rather than on the data changing: a vote that leaves the ranking
 * alone should roll the number and move nothing.
 */
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
            {/* The count sits under the control, not beside it, so a thumb that
                misses the arrow does not hit the number instead. */}
            <Stack gap={2} align="center" style={{ flex: 'none', width: 44 }}>
              <ActionIcon
                size="lg"
                radius="md"
                variant={question.youVoted ? 'filled' : 'default'}
                aria-label={question.youVoted ? m.questions__voted() : m.questions__vote()}
                aria-pressed={question.youVoted}
                // One person, one vote — the server refuses a second, so the
                // control refuses first rather than teaching them by failing.
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
