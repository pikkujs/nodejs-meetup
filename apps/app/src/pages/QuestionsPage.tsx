import { useState, type FC } from 'react'
import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Card,
  Group,
  Skeleton,
  Stack,
  Text,
  Textarea,
  Title,
} from '@pikku/mantine/core'
import { useQueryClient } from '@tanstack/react-query'
import { usePikkuMutation, usePikkuQuery } from '@project/functions-sdk/pikku/api.gen'
import { asI18n, m } from '@/i18n/messages'
import { useLocale } from '@/i18n/config'
import { useAttendee } from '@/lib/attendee'
import { LIVE, live } from '@/lib/live'
import { useLiveBoard } from '@/lib/apply-live'
import { useReorderAnimation } from '@/lib/reorder'
import { NamePrompt } from '@/components/NamePrompt'
import { RollingNumber } from '@/components/RollingNumber'

const MIN_BODY = 3
const MAX_BODY = 280

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

/**
 * The Q&A board — milestones 02 and 03.
 *
 * The talk is never an input to anything here. The board asks the server what is on
 * stage and posts to whatever that is, so a question typed thirty seconds before the
 * organiser advances lands on the talk it was asked about, and nobody can aim a
 * question at a slot that finished an hour ago.
 */
export const QuestionsPage: FC = () => {
  useLocale()
  const queryClient = useQueryClient()
  const { id: attendeeId, name } = useAttendee()
  const [draft, setDraft] = useState('')
  const [naming, setNaming] = useState(false)

  // Votes and new questions arrive pushed, over the room's one websocket, and
  // land in this query's cache. The polling below is now the SAFETY NET, not the
  // mechanism — see knowledge/decisions/the-room-pushes-over-a-websocket.md.
  useLiveBoard()

  const board = usePikkuQuery(
    'listQuestions',
    { attendeeId: attendeeId || undefined },
    live(LIVE.board),
  )

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['listQuestions'] })

  const ask = usePikkuMutation('askQuestion', {
    onSuccess: () => {
      setDraft('')
      refresh()
    },
  })
  const upvote = usePikkuMutation('upvoteQuestion', { onSuccess: refresh })

  const trimmed = draft.trim()
  const tooLong = trimmed.length > MAX_BODY
  const postable = trimmed.length >= MIN_BODY && !tooLong

  /**
   * One control, two outcomes: with a name it posts, without one it asks for the
   * name and posts on the way back. The question they already typed is never lost
   * to the detour.
   */
  const post = (postAs?: string) => {
    const author = postAs ?? name
    if (!postable) return
    if (!author) {
      setNaming(true)
      return
    }
    ask.mutate({ body: trimmed, authorName: author, attendeeId })
  }

  const currentTalk = board.data?.currentTalk
  const questions = board.data?.questions ?? []
  // Re-run the FLIP measurement whenever the ORDER changes — not whenever the
  // data does. A vote that leaves the ranking alone should roll the number and
  // move nothing; keying on the id sequence is what tells those two apart.
  const listRef = useReorderAnimation(questions.map((question) => question.id).join())
  // An interlude — pizza, the break, doors — has no speaker to ask.
  const closed = currentTalk?.kind === 'interlude'

  return (
    <Stack gap="lg" maw={640} w="100%">
      <Box>
        <Title order={1} fz={{ base: 28, sm: 34 }}>
          {m.questions__title()}
        </Title>
        {currentTalk ? (
          <Text c="dimmed" fz="sm" mt={4}>
            {m.questions__for({ title: currentTalk.title })}
          </Text>
        ) : null}
      </Box>

      {board.isError ? (
        <Alert color="red" variant="light" radius="lg">
          {m.questions__list_error()}
        </Alert>
      ) : null}

      {closed ? (
        <Alert variant="light" radius="lg">
          {m.questions__interlude()}
        </Alert>
      ) : (
        <Card withBorder padding="md">
          <Stack gap="sm">
            <Textarea
              aria-label={m.questions__placeholder()}
              placeholder={m.questions__placeholder()}
              value={draft}
              autosize
              minRows={2}
              maxRows={6}
              error={tooLong ? m.questions__too_long() : undefined}
              onChange={(event) => setDraft(event.currentTarget.value)}
            />
            <Group justify="space-between">
              <Text fz="xs" c="dimmed" ff="monospace">
                {asI18n(`${trimmed.length}/${MAX_BODY}`)}
              </Text>
              <Button onClick={() => post()} disabled={!postable} loading={ask.isPending}>
                {m.questions__cta()}
              </Button>
            </Group>
            {ask.isError ? (
              <Text fz="sm" c="red">
                {m.questions__error()}
              </Text>
            ) : null}
          </Stack>
        </Card>
      )}

      {board.isPending ? <Skeleton height={120} radius="lg" /> : null}

      {!board.isPending && !closed && questions.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          {m.questions__empty()}
        </Text>
      ) : null}

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
                  disabled={question.youVoted || !attendeeId}
                  onClick={() => upvote.mutate({ questionId: question.id, attendeeId })}
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

      {upvote.isError ? (
        <Text fz="sm" c="red">
          {m.questions__vote_error()}
        </Text>
      ) : null}

      <NamePrompt
        opened={naming}
        onClose={() => setNaming(false)}
        onNamed={(named) => post(named)}
      />
    </Stack>
  )
}
