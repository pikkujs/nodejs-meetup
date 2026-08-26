/**
 * What the room pushes to every phone and to the wall.
 *
 * ONE TOPIC, not five.
 *
 * The obvious shape is a topic per thing that can happen — `question-asked`,
 * `question-upvoted`, `question-answered`, `schedule-advanced`,
 * `lightning-changed`. Over a WebSocket that would be right: one connection
 * carries every subscription, and narrow topics mean a phone on the lightning
 * screen is not woken by a vote.
 *
 * Over SSE it is a trap. `subscribeToTopic` opens ONE EventSource PER TOPIC, and
 * a browser allows only six concurrent HTTP/1.1 connections per origin. Five
 * streams would leave one for every RPC the page still has to make — post a
 * question, cast a vote, load the schedule — and the sixth request would hang
 * behind the streams rather than fail, which is the worst way for this to break:
 * silent, intermittent, and only on the night. HTTP/2 multiplexes and would be
 * fine, but `vite dev` and a plain node server are HTTP/1.1, so the failure
 * appears in development and disappears in production, or the reverse.
 *
 * So there is one topic and the payload is a discriminated union. One EventSource
 * per phone, five connections still free, and the same code path in dev and on
 * Cloudflare. The cost is that every subscriber sees every event and discards
 * what it does not need — at one meetup's event rate that is free.
 */

/** A question as it goes onto the board, minus anything caller-specific. */
export interface LiveQuestion {
  id: string
  body: string
  authorName: string
  votes: number
  createdAt: string
}

/**
 * Every event carries `talkId` — which talk's board it concerns — so a phone can
 * drop an event for a talk it is no longer showing instead of applying it to the
 * wrong board. A phone that advanced late would otherwise splice a question from
 * the previous talk into the current one.
 *
 * Notably ABSENT: `youVoted`. It is per-caller, and this payload is broadcast to
 * everyone, so it cannot be in here without being wrong for all but one
 * recipient. Someone else's vote does not change whether YOU voted, so the client
 * keeps its own value untouched — see apps/app/src/lib/live-events.ts.
 */
export type MeetupLiveEvent =
  | { kind: 'question-asked'; talkId: string; question: LiveQuestion }
  | { kind: 'question-upvoted'; talkId: string; questionId: string; votes: number }
  | { kind: 'question-answered'; talkId: string; questionId: string }
  | { kind: 'schedule-advanced'; talkId: string }
  | { kind: 'lightning-changed' }

/**
 * The topic map is the BARE EVENT, because the WebSocket client unwraps.
 *
 * THE TWO TRANSPORTS DISAGREE, and this is worth stating plainly because it is
 * not documented anywhere and it cost a debugging session:
 *
 * - WebSocket: the client multiplexes topics down one socket, so it needs the
 *   `{ topic, data }` envelope to know which handler to call — and having used
 *   `topic`, it hands the handler `data` alone.
 * - SSE: one EventSource per topic, no dispatch needed, so the client passes
 *   `JSON.parse(...)` straight through — the handler receives the whole envelope.
 *
 * Publishers therefore always send the envelope, and what a subscriber receives
 * depends on how it connected. This project is on the WebSocket transport (see
 * knowledge/decisions/the-room-pushes-over-a-websocket.md for why SSE could not
 * be used), so the map is typed as what a WebSocket handler is handed: the event.
 */
export type EventHubTopics = {
  'meetup-live': MeetupLiveEvent
}
