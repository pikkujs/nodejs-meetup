import type { FC } from 'react'
import { Badge, Box, Group, Stack, Text } from '@pikku/mantine/core'
import { usePikkuQuery } from '@project/functions-sdk/pikku/api.gen'
import { asI18n, m } from '@/i18n/messages'
import { useLocale } from '@/i18n/config'
import { liveOnStage } from '@/lib/live'
import { useLiveBoard } from '@/lib/apply-live'
import { useReorderAnimation } from '@/lib/reorder'
import { QrCode } from '@/components/QrCode'
import { RollingNumber } from '@/components/RollingNumber'

/**
 * The projected board — milestone 06. This is the one we put on the wall.
 *
 * Everything here is sized in `vw`/`vh` rather than px, because the only thing that
 * matters is the fraction of the projection a line of text occupies: the same page
 * is thrown at a 3m screen and a 55" TV, and both need the back row to read it.
 *
 * No shell, no navigation, nothing to click. Nobody is holding this screen.
 */
export const StagePage: FC = () => {
  useLocale()
  // The wall is the screen this matters most on: it is watched continuously by
  // forty people and touched by nobody, so a question arriving three seconds late
  // is three seconds of a room looking at a stale board.
  useLiveBoard()
  const stage = usePikkuQuery('getStageView', {}, liveOnStage())

  const current = stage.data?.currentTalk
  const questions = stage.data?.topQuestions ?? []
  const remaining = stage.data?.remaining ?? 0
  const interlude = current?.kind === 'interlude'
  const listRef = useReorderAnimation(questions.map((question) => question.id).join())

  // The URL the room scans, taken from the browser rather than configured: this page
  // is opened by typing an address into a laptop on a venue LAN, and whatever
  // address worked for the laptop is the one that will work for the phones.
  const joinUrl = typeof window === 'undefined' ? '' : `${window.location.origin}/app`

  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '4vh 4vw',
        gap: '3vh',
        background: 'var(--mantine-color-body)',
      }}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Box style={{ minWidth: 0 }}>
          <Text
            ff="monospace"
            tt="uppercase"
            lts={2}
            c="var(--mantine-primary-color-filled)"
            style={{ fontSize: '1.6vw' }}
          >
            {m.tonight__now()}
          </Text>
          <Text fw={700} lh={1.1} style={{ fontSize: '3.2vw' }}>
            {asI18n(current?.title ?? '')}
          </Text>
          {current?.speaker ? (
            <Text c="dimmed" style={{ fontSize: '1.8vw' }}>
              {asI18n(current.speaker)}
            </Text>
          ) : null}
        </Box>

        {/* The code stays up the whole time. Somebody arrives late during every
            single talk, and they should never have to ask what the URL is. */}
        <Stack gap="0.6vh" align="center" style={{ flex: 'none' }}>
          <QrCode value={joinUrl} size={140} label={m.qr__title()} />
          <Text ff="monospace" c="dimmed" style={{ fontSize: '0.9vw' }}>
            {asI18n(joinUrl.replace(/^https?:\/\//, ''))}
          </Text>
        </Stack>
      </Group>

      <Stack gap="2.5vh" ref={listRef} style={{ flex: 1, justifyContent: 'center' }}>
        {interlude ? (
          <Text ta="center" c="dimmed" style={{ fontSize: '3vw' }}>
            {m.stage__interlude()}
          </Text>
        ) : questions.length === 0 ? (
          <Stack gap="1vh" align="center">
            <Text c="dimmed" style={{ fontSize: '3vw' }}>
              {m.stage__no_questions()}
            </Text>
            <Text c="dimmed" style={{ fontSize: '1.6vw' }}>
              {m.stage__prompt()}
            </Text>
          </Stack>
        ) : (
          questions.map((question, index) => (
            <Group
              key={question.id}
              data-reorder-key={question.id}
              wrap="nowrap"
              align="flex-start"
              gap="2vw"
            >
              {/* Rank, not vote count, at this size: from five metres the useful
                  fact is which one the host reads first. */}
              <Text
                ff="monospace"
                fw={700}
                c="var(--mantine-primary-color-filled)"
                style={{ fontSize: '3.6vw', lineHeight: 1, flex: 'none' }}
              >
                {asI18n(String(index + 1))}
              </Text>
              <Box style={{ minWidth: 0 }}>
                <Text fw={600} lh={1.25} style={{ fontSize: '2.6vw' }}>
                  {asI18n(question.body)}
                </Text>
                {/* The name is static; only the count moves. Splitting them lets
                    the number roll without the name flickering beside it. */}
                <Group gap="0.5vw" align="baseline" style={{ fontSize: '1.3vw' }}>
                  <Text c="dimmed" ff="monospace" style={{ fontSize: '1.3vw' }}>
                    {asI18n(`${question.authorName} ·`)}
                  </Text>
                  <RollingNumber
                    value={question.votes}
                    fontSize="1.3vw"
                    fontWeight={400}
                    color="var(--mantine-color-dimmed)"
                    label={m.questions__votes_label()}
                  />
                </Group>
              </Box>
            </Group>
          ))
        )}
      </Stack>

      {remaining > 0 ? (
        <Badge variant="light" size="xl" style={{ alignSelf: 'flex-start' }}>
          {m.stage__more({ count: remaining })}
        </Badge>
      ) : null}
    </Box>
  )
}
