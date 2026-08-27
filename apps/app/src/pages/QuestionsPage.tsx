import { useState, type FC } from 'react'
import { Alert, Box, Button, Card, Group, Stack, Text, Textarea, Title } from '@pikku/mantine/core'
import { useQueryClient } from '@tanstack/react-query'
import { usePikkuMutation, usePikkuQuery } from '@project/functions-sdk/pikku/api.gen'
import { asI18n, m } from '@/i18n/messages'
import { useLocale } from '@/i18n/config'
import { useAttendee } from '@/lib/attendee'
import { LIVE, live } from '@/lib/live'
import { NamePrompt } from '@/components/NamePrompt'
import { QuestionBoard } from '@/components/QuestionBoard'

const MIN_BODY = 3
const MAX_BODY = 280

export const QuestionsPage: FC = () => {
  useLocale()
  const queryClient = useQueryClient()
  const { id: attendeeId, name } = useAttendee()
  const [draft, setDraft] = useState('')
  const [naming, setNaming] = useState(false)

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

      <QuestionBoard
        questions={questions}
        isPending={board.isPending}
        interlude={closed}
        canVote={Boolean(attendeeId)}
        onUpvote={(questionId) => upvote.mutate({ questionId, attendeeId })}
      />

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
