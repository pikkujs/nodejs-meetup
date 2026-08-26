import { useQueryClient, type QueryClient } from '@tanstack/react-query'
import type { RPCOutput, MeetupLiveEvent } from '@project/functions-sdk/types'
import { useLiveEvents } from '@/lib/live-events'

type Board = RPCOutput<'listQuestions'>
type Question = Board['questions'][number]
type Stage = RPCOutput<'getStageView'>

/**
 * The board's ordering, in the browser, matching board.ts on the server EXACTLY.
 *
 * This is a second copy of a sorting rule, which is normally a mistake. It earns
 * its place because the whole point of the live board is that a vote reorders it
 * WITHOUT a round trip — and to do that locally, the client has to know the
 * order. The tie-breakers are the part that matters: votes alone would let two
 * equal questions swap places on every event and flicker, so oldest wins a tie
 * and the id settles the impossible case of the same millisecond.
 *
 * If the server's ordering ever changes, this changes with it — the comment in
 * board.ts says so too.
 */
function inBoardOrder(questions: Question[]): Question[] {
  return [...questions].sort(
    (a, b) =>
      b.votes - a.votes || a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id),
  )
}

/** Patch every cached `listQuestions`, whatever attendee id it was fetched with. */
function patchBoard(client: QueryClient, patch: (board: Board) => Board) {
  client.setQueriesData<Board>({ queryKey: ['listQuestions'] }, (board) =>
    board ? patch(board) : board,
  )
}

function patchStage(client: QueryClient, patch: (stage: Stage) => Stage) {
  client.setQueriesData<Stage>({ queryKey: ['getStageView'] }, (stage) =>
    stage ? patch(stage) : stage,
  )
}

/**
 * Turn one pushed event into a cache update.
 *
 * THE RULE THIS FOLLOWS: patch what the client can compute correctly, refetch
 * what it cannot.
 *
 * A vote is fully computable — the payload carries the authoritative count, the
 * phone holds every question for the talk, and the ordering rule is above. So it
 * is applied with no request at all, which is what makes the number roll and the
 * row climb the instant somebody across the room taps.
 *
 * The WALL is different: it holds only the top three, so a vote on the fourth
 * question can promote a row the projector has never seen. There is no way to
 * know that locally, so the wall patches what it is showing (instant) AND
 * refetches (correct). The patch means it never looks frozen; the refetch means
 * it is never wrong for more than a round trip.
 */
function apply(client: QueryClient, event: MeetupLiveEvent) {
  switch (event.kind) {
    case 'question-upvoted': {
      patchBoard(client, (board) =>
        // An event for a talk this phone is not showing is dropped, not applied.
        // A phone that missed the advance would otherwise splice the previous
        // talk's vote into the current board.
        board.currentTalk.id !== event.talkId
          ? board
          : {
              ...board,
              questions: inBoardOrder(
                board.questions.map((question) =>
                  question.id === event.questionId
                    ? { ...question, votes: event.votes }
                    : question,
                ),
              ),
            },
      )
      patchStage(client, (stage) =>
        stage.currentTalk.id !== event.talkId
          ? stage
          : {
              ...stage,
              topQuestions: inBoardOrder(
                stage.topQuestions.map((question) =>
                  question.id === event.questionId
                    ? { ...question, votes: event.votes }
                    : question,
                ),
              ),
            },
      )
      // Only the wall needs this — see the note above. The phones already hold
      // the whole board and have just sorted it correctly.
      void client.invalidateQueries({ queryKey: ['getStageView'] })
      break
    }

    case 'question-asked': {
      patchBoard(client, (board) => {
        if (board.currentTalk.id !== event.talkId) {
          return board
        }
        // The asker's own phone gets this event too, and may already have the
        // question from the mutation's own refresh. Dedupe by id, or it appears
        // twice on the one screen where that is most obviously a bug.
        if (board.questions.some((question) => question.id === event.question.id)) {
          return board
        }
        return {
          ...board,
          // `youVoted: false` is this client's own truth, not the payload's — you
          // have not voted for a question that did not exist a moment ago, and
          // nobody else's vote state travels in a broadcast.
          questions: inBoardOrder([...board.questions, { ...event.question, youVoted: false }]),
        }
      })
      void client.invalidateQueries({ queryKey: ['getStageView'] })
      break
    }

    case 'question-answered': {
      patchBoard(client, (board) =>
        board.currentTalk.id !== event.talkId
          ? board
          : {
              ...board,
              questions: board.questions.filter((question) => question.id !== event.questionId),
            },
      )
      patchStage(client, (stage) =>
        stage.currentTalk.id !== event.talkId
          ? stage
          : {
              ...stage,
              topQuestions: stage.topQuestions.filter(
                (question) => question.id !== event.questionId,
              ),
            },
      )
      // Removing from the top three promotes the fourth, which the wall does not
      // hold. Refetch rather than show two questions where there should be three.
      void client.invalidateQueries({ queryKey: ['getStageView'] })
      break
    }

    case 'schedule-advanced': {
      // Everything on every screen is now about a different talk. Nothing here is
      // patchable — the new talk's questions have never been fetched — so this is
      // the one event that is a plain refetch of all four views.
      void client.invalidateQueries({ queryKey: ['listSchedule'] })
      void client.invalidateQueries({ queryKey: ['listQuestions'] })
      void client.invalidateQueries({ queryKey: ['getStageView'] })
      break
    }

    case 'lightning-changed': {
      void client.invalidateQueries({ queryKey: ['listLightningSlots'] })
      break
    }
  }
}

/**
 * Subscribe this screen to the room. Mount it once per page that shows live data.
 *
 * Every page gets every event — there is one stream (see live-events.ts) — and
 * the cache updates are keyed by query, not by page, so a phone sitting on the
 * schedule keeps its Q&A board warm and switching tabs shows current data with no
 * loading state at all.
 */
export function useLiveBoard(): void {
  const client = useQueryClient()
  useLiveEvents((event) => apply(client, event))
}
