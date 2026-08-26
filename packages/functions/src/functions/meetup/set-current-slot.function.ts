import { z } from 'zod'
import { pikkuSessionlessFunc } from '#pikku/function'
import { NotFoundError } from '@pikku/core/errors'
import { TalkSchema } from './shared.js'
import { publishLive } from './live.js'

export const SetCurrentSlotInput = z.object({
  talkId: z.string(),
})

export const SetCurrentSlotOutput = z.object({
  currentTalk: TalkSchema,
})

/**
 * Put a named slot on stage. The workflow's version of pressing Next.
 *
 * NOT `expose: true`, and that is the whole point of it existing separately.
 * `advanceSchedule` is the organiser's control and is gated on the shared
 * passcode; a workflow has no passcode and should not be handed one just to move
 * the night along. So the two paths differ in what they can do rather than in
 * what they know: this one takes an explicit slot and is unreachable over
 * `/rpc/:rpcName`, that one moves by exactly one step and is reachable by anyone
 * who can read the sign at the front of the room.
 *
 * See knowledge/decisions/the-schedule-advances-by-hand.md — a clock-driven
 * schedule is still not the source of truth. The workflow is a demo of one, and
 * a human pressing Next overrides it at any point simply by moving the slot the
 * workflow will next read.
 */
export const setCurrentSlot = pikkuSessionlessFunc({
  auth: false,
  description: 'Put a named slot on stage (workflow-internal; not exposed over RPC).',
  input: SetCurrentSlotInput,
  output: SetCurrentSlotOutput,
  func: async ({ kysely, eventHub, logger }, { talkId }) => {
    const talk = await kysely
      .selectFrom('talk')
      .select(['id', 'position', 'timeLabel', 'title', 'speaker', 'blurb', 'kind'])
      .where('id', '=', talkId)
      .executeTakeFirst()

    if (!talk) {
      throw new NotFoundError(`No slot with id ${talkId}`)
    }

    await kysely
      .updateTable('eventState')
      .set({ currentTalkId: talk.id })
      .where('id', '=', 1)
      .execute()

    await publishLive(eventHub, { kind: 'schedule-advanced', talkId: talk.id }, logger)

    return { currentTalk: { ...talk, isCurrent: true } }
  },
})
