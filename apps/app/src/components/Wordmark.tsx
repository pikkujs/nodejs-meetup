import type { FC } from 'react'
import { Text } from '@pikku/mantine/core'
import type { I18nString } from '@pikku/react'

export const Wordmark: FC<{ name: I18nString; size?: number }> = ({ name, size = 30 }) => {
  return (
    <Text fw={700} style={{ fontSize: size * 0.62, letterSpacing: '-0.03em', lineHeight: 1 }}>
      {name}
    </Text>
  )
}
