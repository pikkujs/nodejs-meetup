import { z } from 'zod'
import { pikkuSessionlessFunc } from '#pikku/function'
import { ConflictError } from '@pikku/core/errors'
import { AttendeeId, AttendeeName, QuestionBody, newId, now } from './shared.js'
import { publishLive } from './live.js'

export const AskQuestionInput = z.object({
  body: QuestionBody,
  /** The name they typed once. Not verified, not unique, and not meant to be. */
  authorName: AttendeeName,
  attendeeId: AttendeeId,
})

export const AskQuestionOutput = z.object({
  id: z.string(),
  /** Which slot it landed on. Returned so the client can say so, not so it can choose. */
  talkId: z.string(),
})

/**
 * Ask the current speaker something.
 *
 * The TALK IS NOT AN INPUT. The server reads whatever is current and attaches the
 * question to that — see knowledge/decisions/qa-follows-the-current-talk.md. A
 * client-supplied talk id would mean a phone that had been asleep through the
 * break could post into a talk that finished twenty minutes ago, which is exactly
 * the failure the board's shape exists to prevent.
 */
export const askQuestion = pikkuSessionlessFunc({
  expose: true,
  auth: false,
  description: 'Post a question for whatever talk is on right now.',
  input: AskQuestionInput,
  output: AskQuestionOutput,
  func: async ({ kysely, eventHub, logger }, { body, authorName, attendeeId }) => {
    const state = await kysely
      .selectFrom('eventState')
      .innerJoin('talk', 'talk.id', 'eventState.currentTalkId')
      .select(['talk.id', 'talk.kind', 'talk.title'])
      .where('eventState.id', '=', 1)
      .executeTakeFirstOrThrow()

    // Nothing to ask during doors, the break or pizza. The UI closes the composer
    // during an interlude, but the UI is not the gate — a phone holding a stale
    // board would otherwise post into a slot that takes no questions.
    if (state.kind === 'interlude') {
      throw new ConflictError(
        `There is no talk on right now — ${state.title} is. The board opens again when the next talk starts.`,
      )
    }

    const id = newId()
    const createdAt = now()
    await kysely
      .insertInto('question')
      .values({
        id,
        talkId: state.id,
        body,
        authorName,
        attendeeId,
        createdAt,
        answeredAt: null,
      })
      .execute()

    // The whole row, not a "go and refetch" ping: a board that already holds the
    // question needs no round trip to render it, and the asker's own phone —
    // which is on the same stream as everyone else — dedupes by id rather than
    // showing it twice. It starts at zero votes because nobody has voted yet;
    // `youVoted` is deliberately absent (see eventhub-topics.d.ts).
    await publishLive(
      eventHub,
      {
        kind: 'question-asked',
        talkId: state.id,
        question: { id, body, authorName, votes: 0, createdAt },
      },
      logger,
    )

    return { id, talkId: state.id }
  },
})
