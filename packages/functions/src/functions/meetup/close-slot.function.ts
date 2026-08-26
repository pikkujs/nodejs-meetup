import { z } from 'zod'
import { pikkuSessionlessFunc } from '#pikku/function'
import { TalkJob } from './shared.js'

export const CloseSlotOutput = z.object({
  talkId: z.string(),
  /** The two job ids, so a run's timeline names what it handed off. Empty for an interlude. */
  jobs: z.array(z.string()),
})

/**
 * The end of a slot: hand the outbound work to the queue and return.
 *
 * This is the seam between the workflow and the queue, and it is a function
 * rather than an inline workflow step so that the handoff is a durable step
 * with a name and a recorded result — a run that crashed after the email was
 * enqueued must not enqueue it twice on resume.
 *
 * THE TALK/INTERLUDE DECISION LIVES HERE, not in the workflow, and that is not
 * where it reads most naturally. A workflow body is analysed into a graph
 * before it runs, and an `if` inside the `for..of` is silently dropped from
 * that graph — the branch simply is not in the workflow, and nothing warns.
 * See knowledge/decisions/the-evening-is-a-workflow.md. So the workflow closes
 * every slot unconditionally and this function decides; the doors and the break
 * get no email and no issues.
 *
 * It enqueues and does NOT wait. Whether the email actually sent is the queue's
 * business; the workflow's business is the next talk, and holding the schedule
 * open until GitHub answers is exactly the coupling the queue exists to break.
 *
 * The two jobs go on separate queues on purpose — see src/queues/outbound.queue.ts.
 */
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

    // An unknown slot is not an error here. The organiser can edit the running
    // order mid-evening, and a workflow that started before the edit will ask
    // about a slot that no longer exists — the right answer is to close nothing.
    if (!slot || slot.kind !== 'talk') {
      logger.info(`close-slot: nothing to queue for ${talkId}`)
      return { talkId, jobs: [] }
    }

    const jobs = await Promise.all([
      queueService.add('talk-summary-email', { talkId }),
      // GitHub is somebody else's service on somebody else's wifi. Three
      // attempts with widening gaps covers the venue's network dropping for a
      // minute, which is the failure this will actually meet.
      queueService.add(
        'github-issues',
        { talkId },
        { attempts: 3, backoff: { type: 'exponential', delay: 5_000 } },
      ),
    ])

    return { talkId, jobs }
  },
})
