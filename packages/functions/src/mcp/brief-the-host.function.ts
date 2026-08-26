import { z } from 'zod'
import { pikkuMCPPromptFunc } from '#pikku/mcp'

export const BriefTheHostInput = z.object({})

/**
 * The prompt the host would otherwise have to write at 19:20 with a microphone in
 * one hand, so it ships the questions inline rather than asking the assistant to
 * go and fetch them.
 */
export const briefTheHostPrompt = pikkuMCPPromptFunc({
  input: BriefTheHostInput,
  func: async (_services, _input, { rpc }) => {
    const [{ slots }, { talks, total }] = await Promise.all([
      rpc.invoke('listSchedule', {}),
      rpc.invoke('listAllQuestions', {}),
    ])

    const current = slots.find((slot) => slot.isCurrent)
    const asked = talks
      .flatMap((talk) => talk.questions.map((question) => ({ ...question, talk: talk.title })))
      .map((question) => `- (${question.votes}) [${question.talk}] ${question.body}`)
      .join('\n')

    return [
      {
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text:
            `We are on "${current?.title ?? 'nothing'}". ` +
            `The room has asked ${total} question(s) tonight:\n${asked}` +
            `\n\nGroup them by theme and tell me the two worth asking on stage. Two sentences.`,
        },
      },
    ]
  },
})
