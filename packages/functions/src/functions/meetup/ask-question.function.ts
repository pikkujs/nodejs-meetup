import { z } from 'zod'
import { pikkuSessionlessFunc } from '#pikku/function'
import { ConflictError } from '@pikku/core/errors'
import { AttendeeId, AttendeeName, QuestionBody, newId, now } from './shared.js'
import { publishLive } from './live.js'

export const AskQuestionInput = z.object({
  body: QuestionBody,
  authorName: AttendeeName,
  attendeeId: AttendeeId,
})

export const AskQuestionOutput = z.object({
  id: z.string(),
  talkId: z.string(),
})

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
