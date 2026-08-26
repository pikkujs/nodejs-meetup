import { z } from 'zod'
import { pikkuSessionlessFunc } from '#pikku/function'
import { ConflictError } from '@pikku/core/errors'
import { AttendeeId, AttendeeName, LightningTopic, newId, now } from './shared.js'
import { publishLive } from './live.js'

export const SignUpForLightningInput = z.object({
  name: AttendeeName,
  topic: LightningTopic,
  attendeeId: AttendeeId,
})

export const SignUpForLightningOutput = z.object({
  id: z.string(),
  /** Where they are in the running order, 1-based, as it stands right now. */
  position: z.number().int(),
})

/**
 * Put your name down for a lightning talk.
 *
 * Ungated on purpose. A lightning list that needs approving is a lineup, and a
 * lineup is a different product — knowledge/entities/lightning-slot.md.
 *
 * One slot per device, enforced by the unique constraint on `attendee_id`. The cap
 * is not a rule about fairness; it is what makes "withdraw your own" unambiguous.
 */
export const signUpForLightning = pikkuSessionlessFunc({
  expose: true,
  auth: false,
  description: 'Add yourself to the lightning talk list.',
  input: SignUpForLightningInput,
  output: SignUpForLightningOutput,
  func: async ({ kysely, eventHub, logger }, { name, topic, attendeeId }) => {
    const existing = await kysely
      .selectFrom('lightningSlot')
      .select('id')
      .where('attendeeId', '=', attendeeId)
      .executeTakeFirst()

    if (existing) {
      throw new ConflictError(
        'You are already on the lightning list. Withdraw your slot first if you want to change it.',
      )
    }

    const id = newId()
    await kysely
      .insertInto('lightningSlot')
      .values({ id, name, topic, attendeeId, createdAt: now() })
      .execute()

    const { position } = await kysely
      .selectFrom('lightningSlot')
      .select(({ fn }) => fn.count<number>('id').as('position'))
      .executeTakeFirstOrThrow()

    // No payload: the list is short, ordering is positional, and a refetch of
    // ten rows costs less than keeping a second copy of the ordering rule in the
    // browser and getting it subtly different from the server's.
    await publishLive(eventHub, { kind: 'lightning-changed' }, logger)

    return { id, position: Number(position) }
  },
})
