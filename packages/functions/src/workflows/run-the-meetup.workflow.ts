import { z } from 'zod'
import { pikkuWorkflowFunc } from '#pikku/workflow'

export const RunTheMeetupInput = z.object({
  /**
   * How long a talk gets before the workflow closes it. A string because that
   * is what `workflow.sleep` takes — '25m', '90s'.
   *
   * Short values are not a bug: the demo runs this with '20s' so a room can
   * watch a whole evening happen in two minutes.
   */
  talkDuration: z.string().default('25m'),
  /** Interludes — the break, the doors, the pizza — get their own, shorter clock. */
  interludeDuration: z.string().default('10m'),
})

export const RunTheMeetupOutput = z.object({
  slots: z.number().int(),
})

/**
 * The evening, as a durable program.
 *
 * For each slot in order: put it on stage, wait out its clock, and — if it is
 * a talk rather than an interlude — close it, which queues the summary email
 * and the GitHub issues. Then the next one.
 *
 * WHY THIS IS A WORKFLOW AND NOT A `setInterval`. Every step is persisted, so
 * the process can be deployed over, crash, or be scaled to zero between talks
 * and the evening resumes at the slot it was on rather than starting again at
 * the doors. The sleeps are the whole point: 25 minutes is a very long time to
 * hold a process open, and a workflow does not hold one.
 *
 * IT DOES NOT OWN THE SCHEDULE. `advanceSchedule` — the organiser's Next
 * button — writes the same `eventState.currentTalkId` this does, and whoever
 * writes last wins. A host who is running late simply presses Next and the
 * workflow's next step moves the room on from wherever it now is. See
 * knowledge/decisions/the-schedule-advances-by-hand.md: the clock is a
 * suggestion, and a human with a microphone outranks it.
 *
 * THE BODY IS WRITTEN IN THE SUBSET PKU641 ALLOWS — const/let, if/else,
 * switch, for..of, return, throw and workflow calls, and an input parameter
 * that is named rather than destructured. It is statically analysed into a
 * graph before it ever runs, so this is a real constraint and not a style: a
 * `while` loop or a destructured `{ talkDuration }` fails the build.
 */
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
      // The step name has to be stable across a resume and unique within the
      // run, so it is derived from the position and the slot id — never from
      // the title, which an organiser can edit mid-evening.
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
