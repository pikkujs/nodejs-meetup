import { useState, type FC } from 'react'
import {
  Avatar,
  Menu,
  NavLink,
  UnstyledButton,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@pikku/mantine/core'
import { themeList } from '@project/mantine-themes'
import { asI18n, m } from '@/i18n/messages'
import { supportedLocales, useLocale } from '@/i18n/config'
import { usePreferences } from '@/contexts/preferences'
import { initials } from '@/lib/initials'
import { useAttendee } from '@/lib/attendee'
import { NamePrompt } from '../NamePrompt'
import { LOCALE_LABELS } from '../LanguageSelector'
import { MoonGlyph, SunGlyph } from '../ColorSchemeToggle'
import { AccountGlyph, CheckGlyph, SelectorGlyph, SignOutGlyph } from './nav'
import { usePhone } from './mobileLayout'

export const ShellSettings: FC<{ orientation?: 'vertical' | 'horizontal' }> = ({
  orientation = 'vertical',
}) => {
  useLocale()
  const phone = usePhone()
  const { name, forget } = useAttendee()
  const { setColorScheme } = useMantineColorScheme()
  const scheme = useComputedColorScheme('light')
  const { locale, setLocale, themeId, setThemeId } = usePreferences()
  const [naming, setNaming] = useState(false)

  const horizontal = orientation === 'horizontal'

  const avatar = (
    <Avatar
      size={horizontal ? 30 : 32}
      radius="xl"
      color="primary"
      variant="light"
      name={name ?? ''}
    >
      {asI18n(initials(name, ''))}
    </Avatar>
  )

  const target = horizontal ? (
    <UnstyledButton aria-label={m.app_shell__account()} style={{ lineHeight: 0 }}>
      {avatar}
    </UnstyledButton>
  ) : (
    <NavLink
      component="button"
      aria-label={m.app_shell__account()}
      label={name ? asI18n(name) : m.you__title()}
      leftSection={avatar}
      rightSection={<SelectorGlyph size={14} />}
      styles={{
        root: { borderRadius: 'var(--mantine-radius-md)' },
        body: { minWidth: 0 },
        label: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
      }}
    />
  )

  return (
    <>
      <Menu
        radius="md"
        width={horizontal || phone ? 240 : 'target'}
        position={horizontal ? 'bottom-end' : phone ? 'top-start' : 'right-end'}
        offset={8}
        withinPortal
      >
        <Menu.Target>{target}</Menu.Target>

        <Menu.Dropdown>
          <Menu.Item leftSection={<AccountGlyph />} onClick={() => setNaming(true)}>
            {m.you__change()}
          </Menu.Item>

          <Menu.Item
            closeMenuOnClick={false}
            leftSection={scheme === 'dark' ? <SunGlyph /> : <MoonGlyph />}
            onClick={() => setColorScheme(scheme === 'dark' ? 'light' : 'dark')}
          >
            {scheme === 'dark' ? m.preferences__light_mode() : m.preferences__dark_mode()}
          </Menu.Item>

          {themeList.length > 1 ? (
            <>
              <Menu.Divider />
              <Menu.Label>{m.preferences__theme()}</Menu.Label>
              {themeList.map((theme) => (
                <Menu.Item
                  key={theme.id}
                  closeMenuOnClick={false}
                  rightSection={theme.id === themeId ? <CheckGlyph size={14} /> : undefined}
                  onClick={() => setThemeId(theme.id)}
                >
                  {asI18n(theme.name)}
                </Menu.Item>
              ))}
            </>
          ) : null}

          {supportedLocales.length > 1 ? (
            <>
              <Menu.Divider />
              <Menu.Label>{m.preferences__language()}</Menu.Label>
              {supportedLocales.map((code) => (
                <Menu.Item
                  key={code}
                  closeMenuOnClick={false}
                  rightSection={code === locale ? <CheckGlyph size={14} /> : undefined}
                  onClick={() => setLocale(code)}
                >
                  {asI18n(LOCALE_LABELS[code] ?? code.toUpperCase())}
                </Menu.Item>
              ))}
            </>
          ) : null}

          {name ? (
            <>
              <Menu.Divider />
              <Menu.Item leftSection={<SignOutGlyph />} onClick={forget}>
                {m.you__forget()}
              </Menu.Item>
            </>
          ) : null}
        </Menu.Dropdown>
      </Menu>

      <NamePrompt opened={naming} onClose={() => setNaming(false)} />
    </>
  )
}
