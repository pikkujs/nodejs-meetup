import { useLayoutEffect, useRef } from 'react'

/**
 * Make a re-sorted list visibly travel to its new order — the FLIP technique.
 *
 * THE PROBLEM. The board sorts by votes. When a question overtakes the one above
 * it, React re-renders the list in the new order and both rows appear in their
 * new places on the next frame. Nothing moved as far as the eye is concerned;
 * two rows simply swapped contents, which reads as a glitch rather than as a
 * question climbing. That is precisely the moment the board exists to show.
 *
 * THE TECHNIQUE. FLIP — First, Last, Invert, Play:
 *   First   record every row's position BEFORE the DOM updates.
 *   Last    let React paint the new order; read the positions again.
 *   Invert  transform each row by the delta, putting it back where it looked
 *           like it was — visually nothing has changed yet.
 *   Play    clear the transform on the next frame with a transition, so the row
 *           glides from its old place to its new one.
 *
 * This runs in `useLayoutEffect`, before the browser paints, so the inverted
 * transform is applied in the same frame as the reorder. In a plain `useEffect`
 * the browser would paint the new order first and the animation would start from
 * the destination — a flash, then a pointless slide.
 *
 * REDUCED MOTION. Anyone who has asked their device for less motion gets the
 * instant reorder: this animation is decorative, and a list of things sliding
 * about is exactly what that setting is asking us not to do.
 */

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
      // A row with no recorded position is new to the list — it has nowhere to
      // travel from, so it just appears. Animating it from 0 would fling every
      // newly asked question down the page from the top of the board.
      if (before === undefined || reduced || before === top) {
        continue
      }

      const delta = before - top
      row.style.transition = 'none'
      row.style.transform = `translateY(${delta}px)`
      // Force a reflow so the browser accepts the inverted position as the
      // starting point. Without this read, the two style writes coalesce and the
      // transform is never seen — the row lands in place with no movement.
      void row.offsetHeight
      row.style.transition = `transform ${DURATION_MS}ms ${EASING}`
      row.style.transform = ''
    }

    positions.current = next
  }, [dependency])

  return container
}
