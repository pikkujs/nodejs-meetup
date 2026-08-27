import type { AppStory, AppStoryMeta } from './csf.types'
import { QuestionBoard, type BoardQuestion } from './QuestionBoard'

const questions: BoardQuestion[] = [
  {
    id: 'q1',
    body: 'How do you handle backpressure when the consumer is slower than the stream?',
    authorName: 'Priya',
    votes: 12,
    youVoted: true,
  },
  {
    id: 'q2',
    body: 'Does any of this change under Node 24 with the permission model on?',
    authorName: 'Marco',
    votes: 7,
    youVoted: false,
  },
  {
    id: 'q3',
    body: 'What broke first when you moved it to workers?',
    authorName: 'Ade',
    votes: 3,
    youVoted: false,
  },
]

export default {
  title: 'QuestionBoard',
  component: QuestionBoard,
  group: 'Q&A',
  description:
    'The ranked board a phone holds during a talk. The page owns the poll and the vote; this draws whatever it is handed, which is why every state below is reachable without a server.',
  inputs: [
    {
      name: 'listQuestions',
      kind: 'query',
      type: '{ attendeeId?: string }',
      description: 'Polled every 5s. Returns the current talk and its open questions.',
    },
    {
      name: 'upvoteQuestion',
      kind: 'mutation',
      type: '{ questionId: string; attendeeId: string }',
      description: 'One person, one vote — the server refuses a second.',
    },
  ],
} satisfies AppStoryMeta

export const Loading: AppStory = {
  tag: 'listQuestions: pending',
  args: { questions: [], isPending: true },
}

export const Empty: AppStory = {
  tag: 'listQuestions: no questions yet',
  args: { questions: [] },
}

export const Ranked: AppStory = {
  tag: 'listQuestions: success',
  args: { questions },
}

export const AlreadyVoted: AppStory = {
  tag: 'upvoteQuestion: already cast',
  args: { questions: questions.map((question) => ({ ...question, youVoted: true })) },
}

export const NoAttendeeId: AppStory = {
  tag: 'attendee: no id yet',
  args: { questions, canVote: false },
}

export const Interlude: AppStory = {
  tag: 'listQuestions: interlude',
  args: { questions: [], interlude: true },
}
