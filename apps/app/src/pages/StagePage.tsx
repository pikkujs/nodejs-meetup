import type { FC } from 'react'
import { Box, Group, Stack, Text } from '@pikku/mantine/core'
import { usePikkuQuery } from '@project/functions-sdk/pikku/api.gen'
import { asI18n, m } from '@/i18n/messages'
import { useLocale } from '@/i18n/config'
import { liveOnStage } from '@/lib/live'
import { QrCode } from '@/components/QrCode'
import { StageBoard } from '@/components/StageBoard'

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
  const stage = usePikkuQuery('getStageView', {}, liveOnStage())

  const current = stage.data?.currentTalk
  const questions = stage.data?.topQuestions ?? []
  const remaining = stage.data?.remaining ?? 0
  const interlude = current?.kind === 'interlude'

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

      <StageBoard questions={questions} remaining={remaining} interlude={interlude} />
    </Box>
  )
}
