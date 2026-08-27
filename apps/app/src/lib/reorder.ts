import { useLayoutEffect, useRef } from 'react'

const DURATION_MS = 380
const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)'

export function useReorderAnimation(dependency: string) {
  const container = useRef<HTMLDivElement | null>(null)
  const positions = useRef(new Map<string, number>())

  useLayoutEffect(() => {
    const root = container.current
    if (!root) {
      return
    }

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    const rows = Array.from(root.querySelectorAll<HTMLElement>('[data-reorder-key]'))
    const next = new Map<string, number>()

    for (const row of rows) {
      const key = row.dataset.reorderKey
      if (!key) {
        continue
      }
      const top = row.offsetTop
      next.set(key, top)

      const before = positions.current.get(key)
      if (before === undefined || reduced || before === top) {
        continue
      }

      const delta = before - top
      row.style.transition = 'none'
      row.style.transform = `translateY(${delta}px)`
      void row.offsetHeight
      row.style.transition = `transform ${DURATION_MS}ms ${EASING}`
      row.style.transform = ''
    }

    positions.current = next
  }, [dependency])

  return container
}
