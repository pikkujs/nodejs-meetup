export const LIVE = {
  stage: 3_000,
  board: 5_000,
  schedule: 10_000,
  lightning: 10_000,
} as const

export function live(intervalMs: number) {
  return {
    refetchInterval: intervalMs,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  }
}

export function liveOnStage() {
  return {
    refetchInterval: LIVE.stage,
    refetchIntervalInBackground: true,
  }
}
