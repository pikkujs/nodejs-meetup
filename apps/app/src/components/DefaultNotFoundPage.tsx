import { Box, Button, Group, Stack, Text, Title } from '@pikku/mantine/core'
import { Compass } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { m } from '@/i18n/messages'
import { useLocale } from '@/i18n/config'

export function DefaultNotFoundPage() {
  useLocale()

  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <Stack align="center" gap="md" style={{ maxWidth: 540, width: '100%' }}>
        <Box
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'light-dark(rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.15))',
            color: '#3b82f6',
          }}
        >
          <Compass size={28} />
        </Box>
        <Title order={2} ta="center">
          {m.notfound__title()}
        </Title>
        <Text c="dimmed" ta="center" size="sm">
          {m.notfound__hint()}
        </Text>
        <Group>
          <Button component={Link} to="/" variant="light">
            {m.notfound__home()}
          </Button>
        </Group>
      </Stack>
    </Box>
  )
}
