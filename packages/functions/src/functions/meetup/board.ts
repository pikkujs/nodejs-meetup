import type { Kysely } from 'kysely'
import type { DB } from '#pikku/db/schema.gen.js'

/**
 * The board, read once. Shared by `listQuestions` (every phone in the room) and
 * `getStageView` (the projector) so the wall and the room can never disagree
 * about what is at the top — one ordering rule, in one place.
 */
export async function boardFor(kysely: Kysely<DB>, attendeeId?: string) {
  const state = await kysely
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

  const currentTalk = { ...state, isCurrent: true }

  // An interlude has no board at all, so don't go looking for one.
  if (currentTalk.kind === 'interlude') {
    return { currentTalk, questions: [] }
  }

  const rows = await kysely
    .selectFrom('question')
    .leftJoin('questionVote', 'questionVote.questionId', 'question.id')
    .select(({ fn }) => [
      'question.id',
      'question.body',
      'question.authorName',
      'question.createdAt',
      fn.count<number>('questionVote.attendeeId').as('votes'),
    ])
    .where('question.talkId', '=', currentTalk.id)
    .where('question.answeredAt', 'is', null)
    .groupBy(['question.id', 'question.body', 'question.authorName', 'question.createdAt'])
    // Most-wanted first; oldest wins a tie so the projected board does not
    // reshuffle every three seconds — decisions/design/the-board-is-a-queue.md.
    // Then by id, because two questions posted in the same millisecond would
    // otherwise swap places between polls and flicker on the wall.
    .orderBy('votes', 'desc')
    .orderBy('question.createdAt', 'asc')
    .orderBy('question.id', 'asc')
    .execute()

  // A second small query rather than a conditional aggregate: it is one round
  // trip either way at this size, and "which of these did I vote for" stays
  // readable. Skipped for a phone that has not been named yet — and for an empty
  // board, because `in ()` is a syntax error in SQLite, not an empty result.
  const yours =
    attendeeId && rows.length
      ? await kysely
          .selectFrom('questionVote')
          .select('questionId')
          .where('attendeeId', '=', attendeeId)
          .where(
            'questionId',
            'in',
            rows.map((row) => row.id),
          )
          .execute()
      : []
  const votedByYou = new Set(yours.map((vote) => vote.questionId))

  return {
    currentTalk,
    questions: rows.map((row) => ({
      id: row.id,
      body: row.body,
      authorName: row.authorName,
      createdAt: row.createdAt,
      votes: Number(row.votes),
      youVoted: votedByYou.has(row.id),
    })),
  }
}
