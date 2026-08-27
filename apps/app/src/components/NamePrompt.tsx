import { useEffect, useState, type FC } from 'react'
import { Button, Modal, Stack, Text, TextInput } from '@pikku/mantine/core'
import { m } from '@/i18n/messages'
import { useLocale } from '@/i18n/config'
import { useAttendee } from '@/lib/attendee'

const MAX_NAME = 40

export const NamePrompt: FC<{
  opened: boolean
  onClose: () => void
  onNamed?: (name: string) => void
}> = ({ opened, onClose, onNamed }) => {
  useLocale()
  const { name, setName } = useAttendee()
  const [draft, setDraft] = useState('')

  useEffect(() => {
    if (opened) setDraft(name ?? '')
  }, [opened, name])

  const trimmed = draft.trim()
  const tooLong = trimmed.length > MAX_NAME

  const submit = () => {
    if (!trimmed || tooLong) return
    setName(trimmed)
    onNamed?.(trimmed)
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title={m.you__title()} centered radius="lg">
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {m.you__body()}
        </Text>
        <TextInput
          data-autofocus
          aria-label={m.common__name()}
          placeholder={m.common__name_placeholder()}
          value={draft}
          error={tooLong ? m.you__too_long() : undefined}
          onChange={(event) => setDraft(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') submit()
          }}
        />
        <Button onClick={submit} disabled={!trimmed || tooLong} fullWidth>
          {m.you__cta()}
        </Button>
      </Stack>
    </Modal>
  )
}
