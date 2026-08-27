import { z } from 'zod'
import { pikkuFunc } from '#pikku/function'
import { AttendeeId, newId } from './shared.js'

export const AskTheHostInput = z.object({
  message: z.string().min(1).max(500),
  threadId: z.string().optional(),
  attendeeId: AttendeeId,
})

export const AskTheHostOutput = z.object({
  answer: z.string(),
  threadId: z.string(),
  runId: z.string(),
})

export const askTheHost = pikkuFunc({
  expose: true,
  auth: false,
  description: "Ask the host's assistant about tonight's questions and running order.",
  input: AskTheHostInput,
  output: AskTheHostOutput,
  func: async (_services, { message, threadId, attendeeId }, { rpc }) => {
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
