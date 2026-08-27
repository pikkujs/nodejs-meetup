import { DatabaseSync } from 'node:sqlite'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const DEV_DB = process.env.PIKKU_DEV_DB ?? resolve(process.cwd(), '.pikku-runtime/dev.db')

export function devDatabase(): DatabaseSync {
  if (!existsSync(DEV_DB)) {
    throw new Error(
      `No dev database at ${DEV_DB}. Arrangement steps need one — run \`pikku db reset\` first, ` +
        `or point PIKKU_DEV_DB at it if the runner is started from somewhere other than the repo root.`,
    )
  }
  return new DatabaseSync(DEV_DB)
}

export function withDevDatabase<T>(work: (db: DatabaseSync) => T): T {
  const db = devDatabase()
  try {
    return work(db)
  } finally {
    db.close()
  }
}
