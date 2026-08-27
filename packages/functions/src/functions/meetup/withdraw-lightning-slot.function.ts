import { z } from 'zod'
import { pikkuSessionlessFunc } from '#pikku/function'
import { NotFoundError } from '@pikku/core/errors'
import { AttendeeId } from './shared.js'
import { publishLive } from './live.js'

export const WithdrawLightningSlotInput = z.object({
  attendeeId: AttendeeId,
})

export const WithdrawLightningSlotOutput = z.object({
  withdrawn: z.boolean(),
})

export const withdrawLightningSlot = pikkuSessionlessFunc({
  expose: true,
  auth: false,
  description: 'Withdraw your own lightning talk slot.',
  input: WithdrawLightningSlotInput,
  output: WithdrawLightningSlotOutput,
  func: async ({ kysely, eventHub, logger }, { attendeeId }) => {
    const deleted = await kysely
      .deleteFrom('lightningSlot')
      .where('attendeeId', '=', attendeeId)
      .executeTakeFirst()

    if (Number(deleted?.numDeletedRows ?? 0) === 0) {
      throw new NotFoundError('You are not on the lightning list.')
    }

    await publishLive(eventHub, { kind: 'lightning-changed' }, logger)

    return { withdrawn: true }
  },
})
