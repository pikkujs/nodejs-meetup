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
  position: z.number().int(),
})

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

    await publishLive(eventHub, { kind: 'lightning-changed' }, logger)

    return { id, position: Number(position) }
  },
})
