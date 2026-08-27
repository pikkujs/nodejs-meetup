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
