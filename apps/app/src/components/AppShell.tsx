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

export const AppShell: FC = () => {
  useLocale()
  const navItems = useNavItems()

  return (
    <MantineAppShell
      navbar={{ width: 236, breakpoint: 'sm', collapsed: { mobile: true } }}
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

      <MantineAppShell.Main style={{ display: 'flex', flexDirection: 'column' }}>
        <Outlet />

        <Box hiddenFrom="sm" style={{ flex: 'none', height: TAB_BAR_FOOT }} />

        <MobileTabBar items={navItems} />
      </MantineAppShell.Main>
    </MantineAppShell>
  )
}
