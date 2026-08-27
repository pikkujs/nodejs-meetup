import { rem } from '@pikku/mantine/core'
import { useMediaQuery } from '@mantine/hooks'

export const PHONE_QUERY = '(max-width: 48em)'

export const TAB_BAR_HEIGHT = 56

export const MOBILE_HEADER_HEIGHT = 56

export const TAB_BAR_FOOT = `calc(${rem(TAB_BAR_HEIGHT)} + env(safe-area-inset-bottom, 0px))`

export function usePhone(): boolean {
  return useMediaQuery(PHONE_QUERY) ?? false
}
