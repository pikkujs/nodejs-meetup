import { z } from 'zod'
import { pikkuWorkflowFunc } from '#pikku/workflow'

export const RunTheMeetupInput = z.object({
  talkDuration: z.string().default('25m'),
  interludeDuration: z.string().default('10m'),
})

export const RunTheMeetupOutput = z.object({
  slots: z.number().int(),
})

export const runTheMeetup = pikkuWorkflowFunc({
  auth: false,
  description:
    'Run tonight end to end: advance each slot on a clock, summarise each talk as it closes.',
  input: RunTheMeetupInput,
  output: RunTheMeetupOutput,
  func: async (_services, input, { workflow }) => {
    const schedule = await workflow.do('load-schedule', 'listSchedule', {})
    const slots = schedule.slots
    let index = 0

    for (const slot of slots) {
      index++
      const label = `${index}-${slot.id}`

      await workflow.do(`start-${label}`, 'setCurrentSlot', { talkId: slot.id })
      await workflow.sleep(
        `during-${label}`,
        slot.kind === 'talk' ? input.talkDuration : input.interludeDuration,
      )
      await workflow.do(`close-${label}`, 'closeSlot', { talkId: slot.id })
    }

    return { slots: slots.length }
  },
})
