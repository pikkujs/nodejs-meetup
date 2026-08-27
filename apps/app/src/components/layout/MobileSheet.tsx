import { Drawer, rem } from '@pikku/mantine/core'
import type { ReactNode } from 'react'
import { TAB_BAR_FOOT } from './mobileLayout'

export function MobileSheet({
  opened,
  onClose,
  children,
  fill,
  keepMounted,
}: {
  opened: boolean
  onClose: () => void
  children: ReactNode
  fill?: boolean
  keepMounted?: boolean
}) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="bottom"
      size={fill ? '100%' : 'auto'}
      keepMounted={keepMounted}
      withCloseButton={false}
      padding={0}
      zIndex={180}
      transitionProps={{
        transition: {
          in: { transform: 'translateY(0)' },
          out: { transform: 'translateY(100%)' },
          common: { transformOrigin: 'bottom' },
          transitionProperty: 'transform',
        },
        duration: 240,
        timingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)',
      }}
      overlayProps={{ backgroundOpacity: 0.55 }}
      styles={{
        inner: { alignItems: 'flex-end' },
        content: {
          borderTopLeftRadius: 'var(--mantine-radius-lg)',
          borderTopRightRadius: 'var(--mantine-radius-lg)',
          height: fill ? '100%' : 'auto',
          maxHeight: `calc(100vh - ${rem(fill ? 24 : 64)})`,
          display: 'flex',
          flexDirection: 'column',
        },
        body: {
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          padding: `0 0 calc(${TAB_BAR_FOOT} + ${rem(fill ? 0 : 8)})`,
        },
      }}
    >
      {children}
    </Drawer>
  )
}
