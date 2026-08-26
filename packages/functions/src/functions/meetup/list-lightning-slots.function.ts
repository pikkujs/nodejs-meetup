import { z } from 'zod'
import { pikkuSessionlessFunc } from '#pikku/function'
import { AttendeeId, LightningSlotSchema } from './shared.js'

export const ListLightningSlotsInput = z.object({
  attendeeId: AttendeeId.optional(),
})

export const ListLightningSlotsOutput = z.object({
  /** In sign-up order, because sign-up order IS the running order. */
  slots: z.array(LightningSlotSchema),
  /** Whether the caller is already on the list — the sign-up form reads this. */
  youAreSignedUp: z.boolean(),
})

/**
 * The lightning list — a sign-up sheet on a wall, modelled honestly.
 * See knowledge/entities/lightning-slot.md.
 */
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
      // The device id never leaves the server. The client is told whether a row is
      // theirs, not whose the others are — knowing someone else's device id would
      // be enough to withdraw their slot.
      isYours: !!attendeeId && row.attendeeId === attendeeId,
    }))

    return { slots, youAreSignedUp: slots.some((slot) => slot.isYours) }
  },
})
