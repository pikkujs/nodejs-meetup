import type { FC } from 'react'
import type { I18nString } from '@pikku/react'
import { NavLink, Stack } from '@pikku/mantine/core'
import { Link, useRouterState } from '@tanstack/react-router'
import type { FileRouteTypes } from '@/routeTree.gen'
import { m } from '@/i18n/messages'
import { useLocale } from '@/i18n/config'

export type AppPath = FileRouteTypes['to']

export type NavIcon = FC<{ size?: number }>

export interface NavItem {
  to: AppPath
  label: I18nString
  Icon: NavIcon
}

function navGlyph(d: string): NavIcon {
  return function Glyph({ size = 16 }) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={d} />
      </svg>
    )
  }
}

export const HomeGlyph = navGlyph('M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2')
export const QuestionGlyph = navGlyph(
  'M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2ZM8 8h9M8 12h6',
)
export const LightningGlyph = navGlyph('M13 2 4 14h7l-1 8 9-12h-7l1-8Z')
export const OrganiserGlyph = navGlyph('M4 6h16M4 12h16M4 18h16M9 4v4M15 10v4M7 16v4')
export const QrGlyph = navGlyph(
  'M4 4h6v6H4ZM14 4h6v6h-6ZM4 14h6v6H4ZM14 14h2v2h-2ZM18 14h2v2h-2ZM14 18h2v2h-2ZM18 18h2v2h-2Z',
)
export const AccountGlyph = navGlyph('M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM3 21a7 7 0 0 1 18 0')
export const SignOutGlyph = navGlyph(
  'M16 17l5-5-5-5M21 12H9M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4',
)
export const MoreGlyph = navGlyph('M5 12h.01M12 12h.01M19 12h.01')
export const SelectorGlyph = navGlyph('M8 9l4-4 4 4M8 15l4 4 4-4')
export const CheckGlyph = navGlyph('M20 6 9 17l-5-5')

export function useNavItems(): NavItem[] {
  useLocale()
  return [
    { to: '/app', label: m.tonight__title(), Icon: HomeGlyph },
    { to: '/app/questions', label: m.questions__title(), Icon: QuestionGlyph },
    { to: '/app/lightning', label: m.lightning__title(), Icon: LightningGlyph },
    { to: '/app/organiser', label: m.organiser__title(), Icon: OrganiserGlyph },
    { to: '/app/qr', label: m.qr__title(), Icon: QrGlyph },
  ]
}

export function activeNavPath(pathname: string, items: NavItem[]): string | undefined {
  return items
    .map((i) => i.to as string)
    .filter((to) => pathname === to || pathname.startsWith(to + '/'))
    .sort((a, b) => b.length - a.length)[0]
}

export function useActiveNavPath(items: NavItem[]): string | undefined {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  return activeNavPath(pathname, items)
}

export const NavList: FC<{ items: NavItem[]; onNavigate?: () => void }> = ({
  items,
  onNavigate,
}) => {
  const activePath = useActiveNavPath(items)

  return (
    <Stack gap={2}>
      {items.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          component={Link}
          to={to}
          label={label}
          leftSection={<Icon />}
          active={to === activePath}
          onClick={onNavigate}
        />
      ))}
    </Stack>
  )
}
