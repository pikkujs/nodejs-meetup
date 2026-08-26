import { z } from 'zod'
import { pikkuSessionlessFunc } from '#pikku/function'
import { hasOrganiserPasscode } from '../../permissions.js'

export const StartMeetupRunInput = z.object({
  passcode: z.string(),
  /** Defaults are deliberately tiny: this is the button pressed in front of a room. */
  talkDuration: z.string().default('20s'),
  interludeDuration: z.string().default('10s'),
})

export const StartMeetupRunOutput = z.object({
  runId: z.string(),
})

/**
 * Start the evening now, by hand.
 *
 * The scheduler starts the same workflow at 18:30 on a Thursday, which is the
 * right way for it to happen and the wrong way to SHOW it happening. This is
 * the demo door: same workflow, same steps, durations measured in seconds so
 * the whole night runs while somebody is still looking at the screen.
 *
 * Behind the organiser passcode, because it moves the slot every phone in the
 * room is showing. Same gate as `advanceSchedule`, for the same reason —
 * knowledge/decisions/security/one-shared-passcode.md.
 *
 * Nothing stops two runs existing at once; the second simply also advances the
 * schedule, and the room sees the slots move twice as fast. That is a demo
 * hazard rather than a correctness one, and adding a lock here would be
 * inventing a constraint the real scheduler does not have.
 */
export const startMeetupRun = pikkuSessionlessFunc({
  expose: true,
  auth: false,
  description: 'Start the meetup workflow now, with short slot durations, for a live demo.',
  input: StartMeetupRunInput,
  output: StartMeetupRunOutput,
  permissions: { organiser: hasOrganiserPasscode },
  func: async ({ logger }, { talkDuration, interludeDuration }, { rpc }) => {
    const { runId } = await rpc.startWorkflow('runTheMeetup', { talkDuration, interludeDuration })
    logger.info(`meetup: started run ${runId} by hand`)
    return { runId }
  },
})
