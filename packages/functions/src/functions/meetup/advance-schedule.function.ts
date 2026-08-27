import { z } from 'zod'
import type { Kysely } from 'kysely'
import type { DB } from '#pikku/db/schema.gen.js'
import { pikkuSessionlessFunc } from '#pikku/function'
import { ConflictError } from '@pikku/core/errors'
import { hasOrganiserPasscode } from '../../permissions.js'
import { TalkSchema } from './shared.js'
import { publishLive } from './live.js'

export const AdvanceScheduleInput = z.object({
  passcode: z.string(),
})

export const AdvanceScheduleOutput = z.object({
  currentTalk: TalkSchema,
  nextTalk: TalkSchema.nullable(),
})

export const advanceSchedule = pikkuSessionlessFunc({
  expose: true,
  auth: false,
  description: 'Advance the running order to the next slot.',
  input: AdvanceScheduleInput,
  output: AdvanceScheduleOutput,
  permissions: { organiser: hasOrganiserPasscode },
  func: async ({ kysely, eventHub, logger }) => {
    const current = await kysely
      .selectFrom('eventState')
      .innerJoin('talk', 'talk.id', 'eventState.currentTalkId')
      .select('talk.position')
      .where('eventState.id', '=', 1)
      .executeTakeFirstOrThrow()

    const [next, after] = await Promise.all([
      slotAt(kysely, current.position + 1),
      slotAt(kysely, current.position + 2),
    ])

    if (!next) {
      throw new ConflictError('That was the last slot — the night is over.')
    }

    await kysely
      .updateTable('eventState')
      .set({ currentTalkId: next.id })
      .where('id', '=', 1)
      .execute()

    await publishLive(eventHub, { kind: 'schedule-advanced', talkId: next.id }, logger)

    return {
      currentTalk: { ...next, isCurrent: true },
      nextTalk: after ? { ...after, isCurrent: false } : null,
    }
  },
})

const slotAt = (kysely: Kysely<DB>, position: number) =>
  kysely
    .selectFrom('talk')
    .select(['id', 'position', 'timeLabel', 'title', 'speaker', 'blurb', 'kind'])
    .where('position', '=', position)
    .executeTakeFirst()
