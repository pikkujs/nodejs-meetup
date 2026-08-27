import { pikkuVoidFunc } from '#pikku/function'
import { wireScheduler } from '#pikku/scheduler'

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
  schedule: '30 18 * * 4',
  func: startTonight,
})
