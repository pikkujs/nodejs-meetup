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
