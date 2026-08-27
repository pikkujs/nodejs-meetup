import { z } from 'zod'
import { pikkuSessionlessFunc } from '#pikku/function'
import { hasOrganiserPasscode } from '../../permissions.js'

export const StartMeetupRunInput = z.object({
  passcode: z.string(),
  talkDuration: z.string().default('20s'),
  interludeDuration: z.string().default('10s'),
})

export const StartMeetupRunOutput = z.object({
  runId: z.string(),
})

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
