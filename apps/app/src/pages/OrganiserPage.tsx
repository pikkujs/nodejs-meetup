import { useEffect, useState, type FC } from 'react'
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  PasswordInput,
  Stack,
  Text,
  Title,
} from '@pikku/mantine/core'
import { useQueryClient } from '@tanstack/react-query'
import { usePikkuMutation, usePikkuQuery } from '@project/functions-sdk/pikku/api.gen'
import { asI18n, m } from '@/i18n/messages'
import { useLocale } from '@/i18n/config'
import { LIVE, live } from '@/lib/live'

const PASSCODE_KEY = 'meetup-organiser-passcode'

const readStoredPasscode = () => {
  try {
    return sessionStorage.getItem(PASSCODE_KEY) ?? ''
  } catch {
    return ''
  }
}

const Unlock: FC<{ onUnlocked: (passcode: string) => void }> = ({ onUnlocked }) => {
  useLocale()
  const [draft, setDraft] = useState('')

  const check = usePikkuMutation('checkOrganiserPasscode', {
    onSuccess: (_data, variables) => onUnlocked(variables.passcode),
  })

  const submit = () => {
    if (draft) check.mutate({ passcode: draft })
  }

  return (
    <Stack gap="lg" maw={420} w="100%">
      <Box>
        <Title order={1} fz={{ base: 28, sm: 34 }}>
          {m.organiser__locked_title()}
        </Title>
        <Text c="dimmed" fz="sm" mt={4}>
          {m.organiser__locked_body()}
        </Text>
      </Box>

      <Card withBorder padding="md">
        <Stack gap="sm">
          <PasswordInput
            aria-label={m.organiser__passcode()}
            placeholder={m.organiser__passcode()}
            value={draft}
            error={check.isError ? m.organiser__wrong() : undefined}
            onChange={(event) => setDraft(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') submit()
            }}
          />
          <Button onClick={submit} disabled={!draft} loading={check.isPending} fullWidth>
            {m.organiser__unlock()}
          </Button>
        </Stack>
      </Card>
    </Stack>
  )
}

const Console: FC<{ passcode: string; onLock: () => void }> = ({ passcode, onLock }) => {
  useLocale()
  const queryClient = useQueryClient()

  const where = usePikkuQuery('checkOrganiserPasscode', { passcode }, live(LIVE.schedule))
  const board = usePikkuQuery('listQuestions', {}, live(LIVE.board))

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['checkOrganiserPasscode'] })
    queryClient.invalidateQueries({ queryKey: ['listQuestions'] })
    queryClient.invalidateQueries({ queryKey: ['listSchedule'] })
  }

  const advance = usePikkuMutation('advanceSchedule', { onSuccess: refresh })
  const markAnswered = usePikkuMutation('markQuestionAnswered', { onSuccess: refresh })

  useEffect(() => {
    if (where.isError) onLock()
  }, [where.isError, onLock])

  const current = where.data?.currentTalk
  const next = where.data?.nextTalk
  const questions = board.data?.questions ?? []

  return (
    <Stack gap="xl" maw={720} w="100%">
      <Group justify="space-between" align="flex-start">
        <Title order={1} fz={{ base: 28, sm: 34 }}>
          {m.organiser__title()}
        </Title>
        <Group gap="xs">
          <Button component="a" href="/app/stage" target="_blank" variant="light" size="xs">
            {m.organiser__open_stage()}
          </Button>
          <Button onClick={onLock} variant="subtle" size="xs">
            {m.organiser__lock()}
          </Button>
        </Group>
      </Group>

      <Card withBorder padding="lg">
        <Stack gap="md">
          <Box>
            <Text fz="xs" tt="uppercase" c="dimmed" fw={600} lts={0.6}>
              {m.organiser__now_on()}
            </Text>
            <Group gap="sm" align="baseline">
              <Text ff="monospace" c="dimmed">
                {asI18n(current?.timeLabel ?? '')}
              </Text>
              <Text fz="lg" fw={600}>
                {current ? asI18n(current.title) : m.common__loading()}
              </Text>
            </Group>
          </Box>

          <Divider />

          <Box>
            <Text fz="xs" tt="uppercase" c="dimmed" fw={600} lts={0.6}>
              {m.organiser__up_next()}
            </Text>
            {next ? (
              <Group gap="sm" align="baseline">
                <Text ff="monospace" c="dimmed">
                  {asI18n(next.timeLabel)}
                </Text>
                <Text fw={500}>{asI18n(next.title)}</Text>
              </Group>
            ) : (
              <Text c="dimmed">{m.organiser__nothing_next()}</Text>
            )}
          </Box>

          <Button
            size="md"
            disabled={!next}
            loading={advance.isPending}
            onClick={() => advance.mutate({ passcode })}
          >
            {m.organiser__advance()}
          </Button>

          {advance.isError ? (
            <Text fz="sm" c="red">
              {m.organiser__advance_error()}
            </Text>
          ) : null}
        </Stack>
      </Card>

      <Stack gap="sm">
        <Text fz="xs" tt="uppercase" c="dimmed" fw={600} lts={0.6}>
          {m.organiser__board_title()}
        </Text>

        {questions.length === 0 ? (
          <Text c="dimmed" py="md">
            {m.questions__empty()}
          </Text>
        ) : null}

        {questions.map((question) => (
          <Card key={question.id} withBorder padding="md">
            <Group wrap="nowrap" align="flex-start" justify="space-between" gap="md">
              <Box style={{ minWidth: 0 }}>
                <Group gap="xs" mb={4}>
                  <Badge variant="light" ff="monospace">
                    {asI18n(String(question.votes))}
                  </Badge>
                  <Text fz="xs" c="dimmed">
                    {asI18n(question.authorName)}
                  </Text>
                </Group>
                <Text lh={1.45}>{asI18n(question.body)}</Text>
              </Box>
              <Button
                variant="default"
                size="xs"
                style={{ flex: 'none' }}
                loading={
                  markAnswered.isPending && markAnswered.variables?.questionId === question.id
                }
                onClick={() => markAnswered.mutate({ questionId: question.id, passcode })}
              >
                {m.organiser__mark_answered()}
              </Button>
            </Group>
          </Card>
        ))}

        {markAnswered.isError ? (
          <Text fz="sm" c="red">
            {m.organiser__mark_error()}
          </Text>
        ) : null}
      </Stack>
    </Stack>
  )
}

export const OrganiserPage: FC = () => {
  const [passcode, setPasscode] = useState('')

  useEffect(() => setPasscode(readStoredPasscode()), [])

  const unlock = (value: string) => {
    try {
      sessionStorage.setItem(PASSCODE_KEY, value)
    } catch {}
    setPasscode(value)
  }

  const lock = () => {
    try {
      sessionStorage.removeItem(PASSCODE_KEY)
    } catch {}
    setPasscode('')
  }

  return passcode ? <Console passcode={passcode} onLock={lock} /> : <Unlock onUnlocked={unlock} />
}
