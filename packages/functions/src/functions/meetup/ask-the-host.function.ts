import { z } from 'zod'
import { pikkuFunc } from '#pikku/function'
import { AttendeeId, newId } from './shared.js'

export const AskTheHostInput = z.object({
  message: z.string().min(1).max(500),
  /**
   * Kept across a conversation so the assistant remembers the last question the
   * host asked it. A fresh id starts a fresh conversation.
   */
  threadId: z.string().optional(),
  attendeeId: AttendeeId,
})

export const AskTheHostOutput = z.object({
  answer: z.string(),
  threadId: z.string(),
  /**
   * The grader's handle on this run. A scenario passes it to `expectScore`; the
   * frontend has no use for it, and showing it to a room would be strange.
   */
  runId: z.string(),
})

/**
 * Ask the host's assistant something, from the microphone.
 *
 * This is the only way into `meetup-host`. The scaffolded `/rpc/agent/:agentName`
 * route can reach any agent by name with any `resourceId`, which is the wrong
 * shape for a phone in a dark room: it lets a caller choose whose thread they are
 * continuing. Here the caller chooses neither the agent nor the identity the
 * agent writes under.
 *
 * `context` is where the agent's promised non-person identity actually comes
 * from. `askQuestion` takes an `attendeeId`, and the assistant is given
 * `agent:<attendeeId>` rather than the attendee's own — so a question it posts on
 * someone's behalf is attributable to the assistant, and cannot quietly spend an
 * attendee's vote allowance. The attendee id still travels so the host can see
 * which phone asked.
 */
export const askTheHost = pikkuFunc({
  expose: true,
  auth: false,
  description: "Ask the host's assistant about tonight's questions and running order.",
  input: AskTheHostInput,
  output: AskTheHostOutput,
  func: async (_services, { message, threadId, attendeeId }, { rpc }) => {
    // The run needs a thread whether or not the caller is continuing one, and it
    // does not hand the id back — so the id is settled here and returned.
    const thread = threadId ?? newId()

    const run = await rpc.agent.run('meetupHost', {
      message,
      threadId: thread,
      resourceId: `agent:${attendeeId}`,
      context: `When you put a question on the board, ask it with attendeeId "agent:${attendeeId}" and authorName "the host's assistant".`,
    })

    return { answer: run.result, threadId: thread, runId: run.runId }
  },
})
