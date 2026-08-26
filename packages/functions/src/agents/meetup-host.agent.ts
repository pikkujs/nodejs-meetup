import { pikkuAgent } from '#pikku/agent/pikku-agent-types.gen.js'
import { ref } from '#pikku/function'

/**
 * The host's assistant, on stage.
 *
 * It reads the night and it can put a question on the board, which is the only
 * write it is given. Everything it can reach is a function the room could already
 * call from a phone — there is no agent-only path into the database — so the
 * worst it can do is ask a bad question, which is also the worst an attendee can
 * do. See knowledge/decisions/security/nobody-signs-in.md for why that is the
 * right level of trust here.
 *
 * `askQuestion` takes an `attendeeId`, and the agent is handed one that is
 * plainly not a person (`agent:<something>`), so a question it posts is
 * attributable and cannot silently borrow somebody's vote allowance.
 */
export const meetupHost = pikkuAgent({
  name: 'meetup-host',
  description: "The host's assistant: summarises the night's questions and can ask one on your behalf.",
  role: 'You are the assistant to the host of a Node.js meetup, speaking to the person holding the microphone.',
  personality:
    'Brief and concrete. You are being read aloud to a room, so answer in a sentence or two unless asked for a list. Never invent a question that nobody asked.',
  goal: `Help the host run the Q&A. You can:
- summarise what the room has asked, for the whole night or one talk
- say which questions are most wanted, and which are still unanswered
- put a question on the board when the host dictates one

When you summarise, group by theme rather than repeating every question verbatim, and say how many there were. When you are asked something the tools cannot answer, say so plainly rather than guessing.`,
  model: 'openai/gpt-5-mini',
  tools: [ref('listAllQuestions'), ref('listSchedule'), ref('askQuestion')],
  maxSteps: 6,
  auth: false,
})
