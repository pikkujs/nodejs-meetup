import { DatabaseSync } from 'node:sqlite'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * A direct handle on the dev database, for the platform steps that ARRANGE a scenario.
 *
 * Why not the `kysely` service, like every function in `src/`: a scenario step runs in
 * the RUNNER's process, not the server's, and `createSingletonServices` is explicit
 * that the template never constructs its own dialect — `kysely` is injected by
 * `pikku dev` or by fabric. The runner has no runtime to inject one, so a step that
 * destructures `{ kysely }` gets `undefined`.
 *
 * That leaves three ways to put the evening back at talk one, and this is the least
 * bad:
 *
 * - Add a `setCurrentSlot` RPC. That is product surface invented for a test — a way to
 *   rewind the schedule that no organiser asked for and that would have to be gated,
 *   documented and lived with.
 * - Arrange by calling `advanceSchedule`. The scenario would then assume the very
 *   thing milestone 05 exists to prove, and could never rewind at all.
 * - Open the file. Local-only, obviously a fixture, and it cannot pretend to be
 *   anything else.
 *
 * Local-only is not a caveat here, it is the point: these steps exist to reset shared
 * state between runs, which is exactly what must never happen against a real stage.
 * Pointing this at anything but the dev file would be a category error, and the path is
 * resolved from the repo root rather than accepted from a scenario for that reason.
 */
const DEV_DB = process.env.PIKKU_DEV_DB ?? resolve(process.cwd(), '.pikku-runtime/dev.db')

export function devDatabase(): DatabaseSync {
  if (!existsSync(DEV_DB)) {
    throw new Error(
      `No dev database at ${DEV_DB}. Arrangement steps need one — run \`pikku db reset\` first, ` +
        `or point PIKKU_DEV_DB at it if the runner is started from somewhere other than the repo root.`,
    )
  }
  // Opened per step and closed straight after: a scenario run is a handful of
  // arrangements, and a long-lived handle in the runner would hold a lock across the
  // whole suite while the server is writing to the same file.
  return new DatabaseSync(DEV_DB)
}

/** Run something against the dev database and always close the handle. */
export function withDevDatabase<T>(work: (db: DatabaseSync) => T): T {
  const db = devDatabase()
  try {
    return work(db)
  } finally {
    db.close()
  }
}
