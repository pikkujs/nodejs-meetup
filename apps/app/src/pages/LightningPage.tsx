import { useState, type FC } from 'react'
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Group,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Title,
} from '@pikku/mantine/core'
import { useQueryClient } from '@tanstack/react-query'
import { usePikkuMutation, usePikkuQuery } from '@project/functions-sdk/pikku/api.gen'
import { asI18n, m } from '@/i18n/messages'
import { useLocale } from '@/i18n/config'
import { useAttendee } from '@/lib/attendee'
import { LIVE, live } from '@/lib/live'
import { NamePrompt } from '@/components/NamePrompt'

const MIN_TOPIC = 3
const MAX_TOPIC = 80

export const LightningPage: FC = () => {
  useLocale()
  const queryClient = useQueryClient()
  const { id: attendeeId, name } = useAttendee()
  const [topic, setTopic] = useState('')
  const [naming, setNaming] = useState(false)

  const list = usePikkuQuery(
    'listLightningSlots',
    { attendeeId: attendeeId || undefined },
    live(LIVE.lightning),
  )

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['listLightningSlots'] })

  const signUp = usePikkuMutation('signUpForLightning', {
    onSuccess: () => {
      setTopic('')
      refresh()
    },
  })
  const withdraw = usePikkuMutation('withdrawLightningSlot', { onSuccess: refresh })

  const trimmed = topic.trim()
  const tooLong = trimmed.length > MAX_TOPIC
  const ready = trimmed.length >= MIN_TOPIC && !tooLong

  const add = (signAs?: string) => {
    const who = signAs ?? name
    if (!ready) return
    if (!who) {
      setNaming(true)
      return
    }
    signUp.mutate({ name: who, topic: trimmed, attendeeId })
  }

  const slots = list.data?.slots ?? []
  const youAreSignedUp = list.data?.youAreSignedUp ?? false

  return (
    <Stack gap="lg" maw={640} w="100%">
      <Box>
        <Title order={1} fz={{ base: 28, sm: 34 }}>
          {m.lightning__title()}
        </Title>
        <Text c="dimmed" fz="sm" mt={4}>
          {m.lightning__body()}
        </Text>
      </Box>

      {list.isError ? (
        <Alert color="red" variant="light" radius="lg">
          {m.lightning__list_error()}
        </Alert>
      ) : null}

      {youAreSignedUp ? (
        <Alert variant="light" radius="lg" title={m.lightning__youre_up()}>
          <Button
            variant="subtle"
            size="compact-sm"
            px={0}
            loading={withdraw.isPending}
            onClick={() => withdraw.mutate({ attendeeId })}
          >
            {m.lightning__withdraw()}
          </Button>
        </Alert>
      ) : (
        <Card withBorder padding="md">
          <Stack gap="sm">
            <TextInput
              aria-label={m.lightning__topic()}
              placeholder={m.lightning__topic_placeholder()}
              value={topic}
              maxLength={MAX_TOPIC + 1}
              error={tooLong ? m.questions__too_long() : undefined}
              onChange={(event) => setTopic(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') add()
              }}
            />
            <Button onClick={() => add()} disabled={!ready} loading={signUp.isPending}>
              {m.lightning__cta()}
            </Button>
            {signUp.isError ? (
              <Text fz="sm" c="red">
                {m.lightning__error()}
              </Text>
            ) : null}
          </Stack>
        </Card>
      )}

      {list.isPending ? <Skeleton height={120} radius="lg" /> : null}

      {!list.isPending && slots.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          {m.lightning__empty()}
        </Text>
      ) : null}

      <Stack gap={0}>
        {slots.map((slot, index) => (
          <Group key={slot.id} wrap="nowrap" align="flex-start" gap="md" py="sm">
            <Text ff="monospace" fz="sm" c="dimmed" w={32} style={{ flex: 'none' }}>
              {m.lightning__position({ position: index + 1 })}
            </Text>
            <Box style={{ minWidth: 0 }}>
              <Group gap="xs">
                <Text fw={500}>{asI18n(slot.name)}</Text>
                {slot.isYours ? (
                  <Badge size="sm" variant="light">
                    {m.lightning__you()}
                  </Badge>
                ) : null}
              </Group>
              <Text fz="sm" c="dimmed" lh={1.4}>
                {asI18n(slot.topic)}
              </Text>
            </Box>
          </Group>
        ))}
      </Stack>

      <NamePrompt
        opened={naming}
        onClose={() => setNaming(false)}
        onNamed={(named) => add(named)}
      />
    </Stack>
  )
}
