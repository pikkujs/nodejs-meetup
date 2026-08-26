import type { FC } from 'react'
import { AppShell as MantineAppShell, Box, Divider, Stack } from '@pikku/mantine/core'
import { Outlet } from '@tanstack/react-router'
import { m } from '@/i18n/messages'
import { useLocale } from '@/i18n/config'
import { Wordmark } from './Wordmark'
import { MobileTabBar } from './layout/MobileTabBar'
import { NavList, useNavItems } from './layout/nav'
import { ShellSettings } from './layout/ShellSettings'
import { TAB_BAR_FOOT } from './layout/mobileLayout'

/**
 * The attendee shell: a foot bar on a phone, a sidebar on the organiser's laptop.
 *
 * Phone-first is not a preference here — essentially every person who opens this
 * is standing in a dark room holding a phone in one hand, so the four destinations
 * live at the bottom of the screen where a thumb reaches. The sidebar exists for
 * the one person running the evening off a laptop.
 *
 * The projector screens (`/app/stage`, `/app/qr`) deliberately do NOT mount this —
 * see knowledge/decisions/one-app-three-paths.md.
 */
export const AppShell: FC = () => {
  useLocale()
  const navItems = useNavItems()

  return (
    <MantineAppShell
      navbar={{ width: 236, breakpoint: 'sm', collapsed: { mobile: true } }}
      // `xl` on a 390px phone spends 64 of 390 points on gutters.
      padding={{ base: 'md', sm: 'xl' }}
    >
      <MantineAppShell.Navbar p="md">
        <Stack h="100%" gap={4}>
          <Box px="xs" py="sm">
            <Wordmark name={m.app__name()} size={22} />
          </Box>

          <Box mt="xs">
            <NavList items={navItems} />
          </Box>

          <Box mt="auto" pt="xs">
            <Divider mb="xs" />
            <ShellSettings />
          </Box>
        </Stack>
      </MantineAppShell.Navbar>

      {/* Flex column so a full-height page can fill the region with `flex: 1`. */}
      <MantineAppShell.Main style={{ display: 'flex', flexDirection: 'column' }}>
        <Outlet />

        {/* Clears the foot bar. A spacer rather than padding on Main, so it can be
            hidden above `sm` instead of leaving dead space on desktop. */}
        <Box hiddenFrom="sm" style={{ flex: 'none', height: TAB_BAR_FOOT }} />

        <MobileTabBar items={navItems} />
      </MantineAppShell.Main>
    </MantineAppShell>
  )
}
