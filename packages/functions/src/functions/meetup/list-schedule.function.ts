import { z } from 'zod'
import { pikkuSessionlessFunc } from '#pikku/function'
import { TalkSchema } from './shared.js'

export const ListScheduleInput = z.object({})

export const ListScheduleOutput = z.object({
  /** Tonight, in order, doors to doors. Interludes included — they are the evening too. */
  slots: z.array(TalkSchema),
  currentTalkId: z.string(),
})

/**
 * Tonight's running order, and which slot is on now.
 *
 * Sessionless and ungated: this is the first thing a phone loads after scanning
 * the code at the door, and there is nobody to be — see
 * knowledge/decisions/security/nobody-signs-in.md.
 */
export const listSchedule = pikkuSessionlessFunc({
  expose: true,
  mcp: true,
  readonly: true,
  auth: false,
  description: "Tonight's running order, and which slot is current.",
  input: ListScheduleInput,
  output: ListScheduleOutput,
  func: async ({ kysely }) => {
    const [slots, state] = await Promise.all([
      kysely
        .selectFrom('talk')
        .select(['id', 'position', 'timeLabel', 'title', 'speaker', 'blurb', 'kind'])
        .orderBy('position', 'asc')
        .execute(),
      kysely
        .selectFrom('eventState')
        .select('currentTalkId')
        .where('id', '=', 1)
        .executeTakeFirstOrThrow(),
    ])

    return {
      slots: slots.map((slot) => ({ ...slot, isCurrent: slot.id === state.currentTalkId })),
      currentTalkId: state.currentTalkId,
    }
  },
})
