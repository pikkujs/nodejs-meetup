import { z } from 'zod'
import { pikkuSessionlessFunc } from '#pikku/function'
import { TalkJob } from './shared.js'

export const CloseSlotOutput = z.object({
  talkId: z.string(),
  jobs: z.array(z.string()),
})

export const closeSlot = pikkuSessionlessFunc({
  auth: false,
  description: 'Queue the summary email and the GitHub issues for a slot that has just ended.',
  input: TalkJob,
  output: CloseSlotOutput,
  func: async ({ kysely, queueService, logger }, { talkId }) => {
    const slot = await kysely
      .selectFrom('talk')
      .select(['id', 'kind'])
      .where('id', '=', talkId)
      .executeTakeFirst()

    if (!slot || slot.kind !== 'talk') {
      logger.info(`close-slot: nothing to queue for ${talkId}`)
      return { talkId, jobs: [] }
    }

    const jobs = await Promise.all([
      queueService.add('talk-summary-email', { talkId }),
      queueService.add(
        'github-issues',
        { talkId },
        { attempts: 3, backoff: { type: 'exponential', delay: 5_000 } },
      ),
    ])

    return { talkId, jobs }
  },
})
