import { Select } from '@pikku/mantine/core'
import { m } from '@/i18n/messages'
import { useLocale } from '@/i18n/config'
import { themeList } from '@project/mantine-themes'
import { usePreferences } from '@/contexts/preferences'

export function ThemeSelector() {
  useLocale()
  const { themeId, setThemeId } = usePreferences()

  if (themeList.length <= 1) return null

  return (
    <Select
      aria-label={m.preferences__theme()}
      data={themeList.map((t) => ({ value: t.id, label: t.name }))}
      value={themeId}
      onChange={(v) => v && setThemeId(v)}
      size="xs"
      w={110}
      allowDeselect={false}
    />
  )
}
