/**
 * How often each surface refetches — knowledge/decisions/live-means-polling.md.
 *
 * The numbers live in one file because they are a single decision about one room's
 * wifi, not four independent choices, and because the projector's 3s is the one
 * that must never quietly drift up.
 */
export const LIVE = {
  /** Nobody is touching the projector; it must never look stale to a room. */
  stage: 3_000,
  /** Votes move while you are reading. Slower than this feels broken. */
  board: 5_000,
  /** Changes a handful of times all night. */
  schedule: 10_000,
  /** Changes a handful of times all night. */
  lightning: 10_000,
} as const

/**
 * Query options for a surface that has to stay current.
 *
 * `refetchIntervalInBackground: false` is the point: a phone in a pocket for forty
 * minutes should not have spent forty minutes polling, and the refetch on focus
 * means it is current again by the time they have looked at it.
 */
export function live(intervalMs: number) {
  return {
    refetchInterval: intervalMs,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  }
}

/**
 * The projector is the exception: it IS the background tab, more or less — a laptop
 * lid open on a lectern, the browser possibly not focused, nobody to notice it has
 * stopped. It keeps polling regardless.
 */
export function liveOnStage() {
  return {
    refetchInterval: LIVE.stage,
    refetchIntervalInBackground: true,
  }
}
