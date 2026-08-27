export interface LiveQuestion {
  id: string
  body: string
  authorName: string
  votes: number
  createdAt: string
}

export type MeetupLiveEvent =
  | { kind: 'question-asked'; talkId: string; question: LiveQuestion }
  | { kind: 'question-upvoted'; talkId: string; questionId: string; votes: number }
  | { kind: 'question-answered'; talkId: string; questionId: string }
  | { kind: 'schedule-advanced'; talkId: string }
  | { kind: 'lightning-changed' }

export type EventHubTopics = {
  'meetup-live': MeetupLiveEvent
}
