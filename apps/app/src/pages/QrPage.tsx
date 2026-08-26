import type { FC } from 'react'
import { Box, Stack, Text } from '@pikku/mantine/core'
import { asI18n, m } from '@/i18n/messages'
import { useLocale } from '@/i18n/config'
import { QrCode } from '@/components/QrCode'

/**
 * The room's poster — milestone 07.
 *
 * A whole screen holding one code, so it can be thrown up between talks or left on
 * a laptop by the door. Separate from the stage view because they are shown at
 * different moments: this one is for the five minutes before anything starts.
 */
export const QrPage: FC = () => {
  useLocale()
  const joinUrl = typeof window === 'undefined' ? '' : `${window.location.origin}/app`

  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4vh 4vw',
        background: 'var(--mantine-color-body)',
      }}
    >
      <Stack align="center" gap="3vh">
        <Text fw={700} style={{ fontSize: '4vw', lineHeight: 1.1 }}>
          {m.qr__title()}
        </Text>

        {/* Sized off the viewport's SHORT edge: a projector is 16:9 and a code
            sized in `vw` would run off the bottom. */}
        <QrCode value={joinUrl} size="min(52vh, 52vw)" label={m.qr__title()} />

        <Text c="dimmed" style={{ fontSize: '1.8vw' }}>
          {m.qr__body()}
        </Text>
        <Text ff="monospace" style={{ fontSize: '2vw' }}>
          {asI18n(joinUrl.replace(/^https?:\/\//, ''))}
        </Text>
      </Stack>
    </Box>
  )
}
