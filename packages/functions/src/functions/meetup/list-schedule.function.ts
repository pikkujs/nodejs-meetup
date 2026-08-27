import { z } from 'zod'
import { pikkuSessionlessFunc } from '#pikku/function'
import { TalkSchema } from './shared.js'

export const ListScheduleInput = z.object({})

export const ListScheduleOutput = z.object({
  slots: z.array(TalkSchema),
  currentTalkId: z.string(),
})

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
