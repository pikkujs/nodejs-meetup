import { z } from 'zod'
import { pikkuScenarioStep } from '#pikku/scenarios'

export const TheLightningListReadsInput = z.object({
  /** A name expected on the list. */
  name: z.string(),
  /** Where it should sit, 1-based. Omit to assert presence without order. */
  position: z.number().int().optional(),
  /** Read as this device, so `isYours` reflects the right person. */
  attendeeId: z.string().optional(),
  /** Whether this reader should be told the row is theirs to withdraw. */
  isYours: z.boolean().optional(),
  /** False to assert the name is NOT on the list — what a withdrawal means. */
  present: z.boolean().default(true),
})

export const TheLightningListReadsOutput = z.object({
  names: z.array(z.string()),
  position: z.number().int(),
})

/**
 * Assert who is on the lightning list, in what order, and whose row is whose.
 *
 * `isYours` is the interesting assertion, not the ordering: it is the whole of the
 * ownership model — the list is public, and the only thing that makes a row yours is
 * that you sent the device id that created it. Reading the list as somebody else and
 * finding `isYours: false` is what "you can only withdraw your own" means before any
 * button exists.
 */
export const theLightningListReads = pikkuScenarioStep({
  name: 'theLightningListReads',
  actor: true,
  description: 'asserts who is on the lightning list and in what order',
  template: 'the lightning list has {name} at {position}',
  input: TheLightningListReadsInput,
  output: TheLightningListReadsOutput,
  default: async (_services, { name, position, attendeeId, isYours, present }, { actor }) => {
    const list = await actor.invoke('listLightningSlots', { attendeeId })
    const names = list.slots.map((slot) => slot.name)
    const index = list.slots.findIndex((slot) => slot.name === name)

    if (!present) {
      if (index >= 0) {
        throw new Error(
          `Expected "${name}" to be off the lightning list, but it reads: ${JSON.stringify(names)}.`,
        )
      }
      return { names, position: 0 }
    }

    if (index < 0) {
      throw new Error(
        `Expected "${name}" on the lightning list, which reads: ${JSON.stringify(names)}.`,
      )
    }

    if (position !== undefined && index + 1 !== position) {
      throw new Error(
        `Expected "${name}" at #${position} on the lightning list, found them at #${index + 1}: ` +
          `${JSON.stringify(names)}. Sign-up order is the running order.`,
      )
    }

    const row = list.slots[index]!
    if (isYours !== undefined && row.isYours !== isYours) {
      throw new Error(
        `Expected "${name}"'s slot to read isYours=${isYours} for this reader, got ${row.isYours}. ` +
          `A row that reads as yours is a row the app offers to withdraw.`,
      )
    }

    return { names, position: index + 1 }
  },
})
