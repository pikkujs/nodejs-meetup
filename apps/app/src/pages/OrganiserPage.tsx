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

/**
 * The passcode is held in `sessionStorage`, not `localStorage`: the organiser
 * refreshes this page during the evening and should not be locked out mid-talk, but
 * a phone that has been handed round afterwards should not still be unlocked.
 *
 * This is a convenience, not a gate. Nothing on this screen trusts it — every action
 * sends the passcode and the FUNCTION decides, so pasting a value into storage by
 * hand buys you a screen whose buttons all fail.
 */
const PASSCODE_KEY = 'meetup-organiser-passcode'

const readStoredPasscode = () => {
  try {
    return sessionStorage.getItem(PASSCODE_KEY) ?? ''
  } catch {
    // Safari private mode throws on sessionStorage. Typing it again is fine.
    return ''
  }
}

/** The passcode screen — one field, in a dark room, with a talk already running. */
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

/** Everything the passcode buys: the running order, and the board. */
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

  // A passcode that stopped working (rotated between talks, or pasted in by hand)
  // must not leave them on a console whose every button fails: drop straight back to
  // the passcode field, which is the only thing that can fix it.
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
          {/* Plain anchor, not a router Link: the projector screen belongs in a
              second window on the second display, not in this tab. */}
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

          {/* The single irreversible-looking action of the evening, so it is large,
              alone, and says what it will do rather than "Next". */}
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

/**
 * The organiser screen — milestone 05.
 *
 * Two states in one route rather than two routes, because the URL is read out loud
 * ("go to /app/organiser") and a redirect to a login path would be one more thing to
 * explain in a dark room.
 */
export const OrganiserPage: FC = () => {
  const [passcode, setPasscode] = useState('')

  // From storage after mount, never during render: this route is client-only, but
  // reading storage in a render body is the kind of thing that survives until
  // somebody turns SSR back on.
  useEffect(() => setPasscode(readStoredPasscode()), [])

  const unlock = (value: string) => {
    try {
      sessionStorage.setItem(PASSCODE_KEY, value)
    } catch {
      // Unlocked for this render either way; they just retype it after a refresh.
    }
    setPasscode(value)
  }

  const lock = () => {
    try {
      sessionStorage.removeItem(PASSCODE_KEY)
    } catch {
      // Nothing stored, nothing to clear.
    }
    setPasscode('')
  }

  return passcode ? <Console passcode={passcode} onLock={lock} /> : <Unlock onUnlocked={unlock} />
}
