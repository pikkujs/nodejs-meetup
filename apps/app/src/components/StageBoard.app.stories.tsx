import type { AppStory, AppStoryMeta } from './csf.types'
import { StageBoard, type StageQuestion } from './StageBoard'

const questions: StageQuestion[] = [
  {
    id: 'q1',
    body: 'How do you handle backpressure when the consumer is slower than the stream?',
    authorName: 'Priya',
    votes: 12,
  },
  {
    id: 'q2',
    body: 'Does any of this change under Node 24 with the permission model on?',
    authorName: 'Marco',
    votes: 7,
  },
  {
    id: 'q3',
    body: 'What broke first when you moved it to workers?',
    authorName: 'Ade',
    votes: 3,
  },
]

export default {
  title: 'StageBoard',
  component: StageBoard,
  group: 'Q&A',
  description:
    'What the projector shows. Rank rather than vote count, because from five metres the useful fact is which question the host reads first.',
  inputs: [
    {
      name: 'getStageView',
      kind: 'query',
      type: '{}',
      description:
        'Polled every 3s while a talk is on. Returns the current slot, the top questions, and how many did not fit.',
    },
  ],
} satisfies AppStoryMeta

export const Waiting: AppStory = {
  tag: 'getStageView: no questions yet',
  args: { questions: [] },
}

export const Ranked: AppStory = {
  tag: 'getStageView: success',
  args: { questions },
}

export const MoreThanFit: AppStory = {
  tag: 'getStageView: overflow',
  args: { questions, remaining: 9 },
}

export const Interlude: AppStory = {
  tag: 'getStageView: interlude',
  args: { questions: [], interlude: true },
}
