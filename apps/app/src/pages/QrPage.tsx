import type { FC } from 'react'
import { Box, Card, Stack, Text, Title } from '@pikku/mantine/core'
import { asI18n, m } from '@/i18n/messages'
import { useLocale } from '@/i18n/config'
import { QrCode } from '@/components/QrCode'

/**
 * The join code, in two sizes.
 *
 * `projected` is the wall: one code filling a 16:9 frame with nothing else on it.
 * Without it this is an ordinary page in the nav, sized like the rest of them, so
 * the organiser can hold the code up on a phone without leaving the shell.
 */
export const QrPage: FC<{ projected?: boolean }> = ({ projected }) => {
  useLocale()
  const joinUrl = typeof window === 'undefined' ? '' : `${window.location.origin}/app`
  const shortUrl = asI18n(joinUrl.replace(/^https?:\/\//, ''))

  if (projected) {
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
            {shortUrl}
          </Text>
        </Stack>
      </Box>
    )
  }

  return (
    <Stack gap="lg" maw={640} w="100%">
      <Box>
        <Title order={1} fz={{ base: 28, sm: 34 }}>
          {m.qr__title()}
        </Title>
        <Text c="dimmed" fz="sm" mt={4}>
          {m.qr__body()}
        </Text>
      </Box>

      <Card withBorder padding="lg">
        <Stack align="center" gap="md">
          <QrCode value={joinUrl} size={240} label={m.qr__title()} />
          <Text ff="monospace" fz="sm">
            {shortUrl}
          </Text>
        </Stack>
      </Card>
    </Stack>
  )
}
