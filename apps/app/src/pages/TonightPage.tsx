import type { FC } from 'react'
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
  Title,
} from '@pikku/mantine/core'
import { Link } from '@tanstack/react-router'
import { usePikkuQuery } from '@project/functions-sdk/pikku/api.gen'
import { asI18n, m } from '@/i18n/messages'
import { useLocale } from '@/i18n/config'
import { LIVE, live } from '@/lib/live'
import { useLiveBoard } from '@/lib/apply-live'

type Slot = ReturnType<typeof useSchedule>['slots'][number]

function useSchedule() {
  const query = usePikkuQuery('listSchedule', {}, live(LIVE.schedule))
  return { ...query, slots: query.data?.slots ?? [] }
}

/**
 * One row of the running order.
 *
 * The current slot is not a variant of this — it is the card above, at a different
 * size. A room glancing at a phone for two seconds needs the answer to "what is on
 * now" to be the biggest thing on the screen, not a highlighted row in a list.
 */
const SlotRow: FC<{ slot: Slot; dim?: boolean }> = ({ slot, dim }) => (
  <Group wrap="nowrap" align="baseline" gap="md" py={6} opacity={dim ? 0.55 : 1}>
    <Text ff="monospace" fz="sm" c="dimmed" w={48} style={{ flex: 'none' }}>
      {asI18n(slot.timeLabel)}
    </Text>
    <Box style={{ minWidth: 0 }}>
      <Text fw={500} lh={1.35}>
        {asI18n(slot.title)}
      </Text>
      {slot.speaker ? (
        <Text fz="sm" c="dimmed">
          {asI18n(slot.speaker)}
        </Text>
      ) : null}
    </Box>
  </Group>
)

/**
 * Tonight — milestone 01. The first thing anyone opens, usually mid-talk, to work
 * out what they walked into.
 */
export const TonightPage: FC = () => {
  useLocale()
  // Same one stream as every other screen; this page cares only about
  // schedule-advanced and lightning-changed, and ignores the rest.
  useLiveBoard()
  const { slots, isPending, isError } = useSchedule()

  const currentIndex = slots.findIndex((slot) => slot.isCurrent)
  const current = currentIndex >= 0 ? slots[currentIndex] : undefined
  const earlier = currentIndex > 0 ? slots.slice(0, currentIndex) : []
  const later = currentIndex >= 0 ? slots.slice(currentIndex + 1) : slots

  if (isError) {
    return (
      <Alert color="red" variant="light" radius="lg">
        {m.tonight__error()}
      </Alert>
    )
  }

  return (
    <Stack gap="xl" maw={640} w="100%">
      <Title order={1} fz={{ base: 28, sm: 34 }}>
        {m.tonight__title()}
      </Title>

      {isPending ? <Skeleton height={168} radius="lg" /> : null}

      {current ? (
        <Card
          withBorder
          padding="lg"
          // The green rail carries the same meaning as the word "Now" beside it,
          // never instead of it — knowledge/decisions/design/two-viewing-distances.md.
          style={{ borderLeft: '3px solid var(--mantine-primary-color-filled)' }}
        >
          <Stack gap="xs">
            <Group gap="sm">
              <Badge variant="filled">{m.tonight__now()}</Badge>
              <Text ff="monospace" fz="sm" c="dimmed">
                {asI18n(current.timeLabel)}
              </Text>
            </Group>

            <Title order={2} fz={{ base: 22, sm: 26 }} lh={1.2}>
              {asI18n(current.title)}
            </Title>

            {current.speaker ? <Text fw={500}>{asI18n(current.speaker)}</Text> : null}
            {current.blurb ? (
              <Text fz="sm" c="dimmed" lh={1.5}>
                {asI18n(current.blurb)}
              </Text>
            ) : null}

            {/* Only a talk takes questions; during pizza this would be a dead end. */}
            {current.kind === 'talk' ? (
              <Button component={Link} to="/app/questions" mt="sm" variant="light">
                {m.tonight__ask_cta()}
              </Button>
            ) : null}
          </Stack>
        </Card>
      ) : null}

      {later.length > 0 ? (
        <Stack gap={2}>
          <Text fz="xs" tt="uppercase" c="dimmed" fw={600} lts={0.6}>
            {m.tonight__later()}
          </Text>
          {later.map((slot) => (
            <SlotRow key={slot.id} slot={slot} />
          ))}
        </Stack>
      ) : null}

      {earlier.length > 0 ? (
        <Stack gap={2}>
          <Text fz="xs" tt="uppercase" c="dimmed" fw={600} lts={0.6}>
            {m.tonight__earlier()}
          </Text>
          {earlier.map((slot) => (
            <SlotRow key={slot.id} slot={slot} dim />
          ))}
        </Stack>
      ) : null}
    </Stack>
  )
}
