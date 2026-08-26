import { useEffect, useState, type FC } from 'react'
import { Button, Modal, Stack, Text, TextInput } from '@pikku/mantine/core'
import { m } from '@/i18n/messages'
import { useLocale } from '@/i18n/config'
import { useAttendee } from '@/lib/attendee'

/** The server's cap, restated here so the phone refuses before the round trip does. */
const MAX_NAME = 40

/**
 * "You type your name once and it's remembered."
 *
 * Deliberately NOT a gate on the whole app. Reading tonight's schedule, the board
 * and the lightning list needs no name at all; this only appears at the moment
 * something you post would otherwise be anonymous, and never again after that.
 *
 * @param opened - The caller owns this, because the caller knows what the person
 *   was trying to do when they had no name yet.
 * @param onNamed - Fires once a name is stored, so the caller can finish the post
 *   the person had already written.
 */
export const NamePrompt: FC<{
  opened: boolean
  onClose: () => void
  onNamed?: (name: string) => void
}> = ({ opened, onClose, onNamed }) => {
  useLocale()
  const { name, setName } = useAttendee()
  const [draft, setDraft] = useState('')

  // Seeded on open, not on mount: opened a second time to CHANGE a name, the field
  // should already hold the current one rather than make them retype it.
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
          // Enter submits: this opens over a half-written question and the keyboard
          // is already up.
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
