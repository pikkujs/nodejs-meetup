import { pikkuVoidFunc } from '#pikku/function'
import { wireScheduler } from '#pikku/scheduler'

/**
 * Start the evening at 18:30 on the first Thursday's cron the venue books.
 *
 * The task's only job is to KICK THE WORKFLOW OFF and get out of the way. All
 * the waiting happens inside the workflow, durably — a scheduled task that slept
 * through the evening itself would be a process held open for four hours and
 * lost entirely on a deploy.
 *
 * `startWorkflow` rather than `invoke`: invoking would run the whole evening
 * inline and block the scheduler tick until the last talk ended.
 */
const startTonight = pikkuVoidFunc({
  auth: false,
  description: "Start tonight's meetup workflow.",
  func: async ({ logger }, _data, { rpc }) => {
    const { runId } = await rpc.startWorkflow('runTheMeetup', {
      talkDuration: '25m',
      interludeDuration: '10m',
    })
    logger.info(`meetup: started run ${runId}`)
  },
})

wireScheduler({
  name: 'start-the-meetup',
  // 18:30 every Thursday, in the DEPLOYMENT's timezone — which is UTC on
  // Cloudflare and not the venue's. A meetup that moves nights changes this
  // line; a meetup that is not on tonight has a workflow that advances an
  // empty room, which is harmless and visible in the console.
  schedule: '30 18 * * 4',
  func: startTonight,
})
