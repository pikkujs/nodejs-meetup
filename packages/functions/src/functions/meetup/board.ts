import type { Kysely } from 'kysely'
import type { DB } from '#pikku/db/schema.gen.js'

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
    .orderBy('votes', 'desc')
    .orderBy('question.createdAt', 'asc')
    .orderBy('question.id', 'asc')
    .execute()

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
