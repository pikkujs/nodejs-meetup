import { z } from 'zod'
import { pikkuSessionlessFunc } from '#pikku/function'

export const InboundMessage = z.object({
  senderId: z.string(),
  text: z.string(),
})

const attendeeIdFor = async (senderId: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(senderId))
  return `wa-${Array.from(new Uint8Array(digest).slice(0, 8))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')}`
}

/**
 * A second door into `askQuestion`, for the row at the back with no signal on
 * the venue wifi.
 *
 * Nothing in the app's UI offers this and no QR code points at it — it is wired
 * to show that a gateway is the whole cost of a new way in. The function it runs
 * is the same `askQuestion` a phone calls, so the question lands on the same
 * board, attached to whatever talk is current, with no WhatsApp-shaped path into
 * the database.
 *
 * The sender's phone number never reaches a row. `askQuestion` takes an
 * `attendeeId`, which is what "one person, one vote" counts, so the number is
 * hashed into one — stable enough that the same phone cannot vote twice, and not
 * a phone number in the database of a meetup app
 * (knowledge/decisions/security/nobody-signs-in.md).
 */
export const askByWhatsApp = pikkuSessionlessFunc({
  description: 'Put a question sent over WhatsApp onto the board for the current talk.',
  auth: false,
  input: InboundMessage,
  func: async (_services, { senderId, text }, { rpc }) => {
    await rpc.invoke('askQuestion', {
      body: text.slice(0, 280),
      authorName: 'Someone at the back',
      attendeeId: await attendeeIdFor(senderId),
    })
  },
})
