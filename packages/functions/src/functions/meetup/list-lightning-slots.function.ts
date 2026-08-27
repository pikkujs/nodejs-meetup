import { z } from 'zod'
import { pikkuSessionlessFunc } from '#pikku/function'
import { AttendeeId, LightningSlotSchema } from './shared.js'

export const ListLightningSlotsInput = z.object({
  attendeeId: AttendeeId.optional(),
})

export const ListLightningSlotsOutput = z.object({
  slots: z.array(LightningSlotSchema),
  youAreSignedUp: z.boolean(),
})

export const listLightningSlots = pikkuSessionlessFunc({
  expose: true,
  readonly: true,
  auth: false,
  description: 'The lightning talk sign-up list, in sign-up order.',
  input: ListLightningSlotsInput,
  output: ListLightningSlotsOutput,
  func: async ({ kysely }, { attendeeId }) => {
    const rows = await kysely
      .selectFrom('lightningSlot')
      .select(['id', 'name', 'topic', 'attendeeId'])
      .orderBy('createdAt', 'asc')
      .orderBy('id', 'asc')
      .execute()

    const slots = rows.map((row) => ({
      id: row.id,
      name: row.name,
      topic: row.topic,
      isYours: !!attendeeId && row.attendeeId === attendeeId,
    }))

    return { slots, youAreSignedUp: slots.some((slot) => slot.isYours) }
  },
})
