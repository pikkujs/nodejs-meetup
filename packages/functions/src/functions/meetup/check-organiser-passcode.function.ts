import { z } from 'zod'
import { pikkuSessionlessFunc } from '#pikku/function'
import { hasOrganiserPasscode } from '../../permissions.js'
import { TalkSchema } from './shared.js'

export const CheckOrganiserPasscodeInput = z.object({
  passcode: z.string(),
})

export const CheckOrganiserPasscodeOutput = z.object({
  currentTalk: TalkSchema,
  nextTalk: TalkSchema.nullable(),
})

/**
 * "Is this the passcode?" — asked once, on the passcode screen, before anybody
 * presses Next in front of a room.
 *
 * It carries the SAME permission as the actions it precedes, which is the whole
 * point: it is not a separate, weaker check that a screen then trusts. A wrong
 * passcode is refused here by exactly the mechanism that would refuse
 * `advanceSchedule`, so the two can never disagree.
 *
 * It returns the current and next slot rather than a bare `{ ok: true }` so that
 * unlocking the organiser screen is one round trip instead of two — the passcode
 * is typed in a dark room with a talk already running.
 */
export const checkOrganiserPasscode = pikkuSessionlessFunc({
  expose: true,
  readonly: true,
  auth: false,
  description: 'Verify the organiser passcode and return where the evening is.',
  input: CheckOrganiserPasscodeInput,
  output: CheckOrganiserPasscodeOutput,
  permissions: { organiser: hasOrganiserPasscode },
  func: async ({ kysely }) => {
    const current = await kysely
      .selectFrom('eventState')
      .innerJoin('talk', 'talk.id', 'eventState.currentTalkId')
      .select([
        'talk.id',
        'talk.position',
        'talk.timeLabel',
        'talk.title',
        'talk.speaker',
        'talk.blurb',
        'talk.kind',
      ])
      .where('eventState.id', '=', 1)
      .executeTakeFirstOrThrow()

    const next = await kysely
      .selectFrom('talk')
      .select(['id', 'position', 'timeLabel', 'title', 'speaker', 'blurb', 'kind'])
      .where('position', '=', current.position + 1)
      .executeTakeFirst()

    return {
      currentTalk: { ...current, isCurrent: true },
      nextTalk: next ? { ...next, isCurrent: false } : null,
    }
  },
})
