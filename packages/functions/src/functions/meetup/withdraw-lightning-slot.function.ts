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

/**
 * Take your own name off the lightning list.
 *
 * Signing up in enthusiasm and thinking better of it ten minutes later is the
 * single most predictable thing that happens on a lightning list, so this exists.
 *
 * There is NO slot id in the input. The device id both identifies the row and
 * authorises the delete, which means the shape of the call makes withdrawing
 * somebody else's slot unexpressible rather than merely refused. That is the
 * strongest form this rule can take given nobody signs in — see
 * knowledge/decisions/security/nobody-signs-in.md for what it is and is not worth.
 */
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
