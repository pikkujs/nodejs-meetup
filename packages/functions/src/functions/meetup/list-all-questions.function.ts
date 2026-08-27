import { z } from 'zod'
import { pikkuSessionlessFunc } from '#pikku/function'

export const ListAllQuestionsInput = z.object({
  talkId: z.string().optional(),
  includeAnswered: z.boolean().optional(),
})

export const ListAllQuestionsOutput = z.object({
  talks: z.array(
    z.object({
      talkId: z.string(),
      title: z.string(),
      speaker: z.string().nullable(),
      questions: z.array(
        z.object({
          id: z.string(),
          body: z.string(),
          authorName: z.string(),
          votes: z.number().int(),
          answered: z.boolean(),
        }),
      ),
    }),
  ),
  total: z.number().int(),
})

export const listAllQuestions = pikkuSessionlessFunc({
  expose: true,
  mcp: true,
  readonly: true,
  auth: false,
  description:
    'Every question asked tonight, grouped by talk, with vote counts. Use this to summarise or count questions.',
  input: ListAllQuestionsInput,
  output: ListAllQuestionsOutput,
  func: async ({ kysely }, { talkId, includeAnswered }) => {
    let query = kysely
      .selectFrom('question')
      .innerJoin('talk', 'talk.id', 'question.talkId')
      .leftJoin('questionVote', 'questionVote.questionId', 'question.id')
      .select(({ fn }) => [
        'question.id',
        'question.body',
        'question.authorName',
        'question.answeredAt',
        'talk.id as talkId',
        'talk.title',
        'talk.speaker',
        'talk.position',
        fn.count<number>('questionVote.attendeeId').as('votes'),
      ])
      .groupBy([
        'question.id',
        'question.body',
        'question.authorName',
        'question.answeredAt',
        'talk.id',
        'talk.title',
        'talk.speaker',
        'talk.position',
      ])
      .orderBy('talk.position', 'asc')
      .orderBy('votes', 'desc')
      .orderBy('question.createdAt', 'asc')

    if (talkId) {
      query = query.where('question.talkId', '=', talkId)
    }
    if (!includeAnswered) {
      query = query.where('question.answeredAt', 'is', null)
    }

    const rows = await query.execute()

    const byTalk = new Map<string, ListAllQuestionsOutputTalk>()
    for (const row of rows) {
      let talk = byTalk.get(row.talkId)
      if (!talk) {
        talk = { talkId: row.talkId, title: row.title, speaker: row.speaker, questions: [] }
        byTalk.set(row.talkId, talk)
      }
      talk.questions.push({
        id: row.id,
        body: row.body,
        authorName: row.authorName,
        votes: Number(row.votes),
        answered: row.answeredAt !== null,
      })
    }

    return { talks: [...byTalk.values()], total: rows.length }
  },
})

type ListAllQuestionsOutputTalk = z.infer<typeof ListAllQuestionsOutput>['talks'][number]
