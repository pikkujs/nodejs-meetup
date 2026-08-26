import { z } from 'zod'

/**
 * The shapes the whole meetup shares. One file, because "how long may a name be"
 * has to give the same answer to the composer, the projector and the database.
 */

/**
 * A name is capped at 40 characters because it is rendered at 3vw on a wall five
 * metres away — see knowledge/decisions/design/two-viewing-distances.md. This is a
 * layout constraint wearing a validation constraint's clothes, and it is written
 * down here so nobody "fixes" it later.
 */
export const AttendeeName = z.string().trim().min(1).max(40)

/**
 * A device id, generated in the browser. A CLAIM, NOT A CREDENTIAL — it dedupes
 * votes and owns a lightning slot, and it protects nothing valuable. See
 * knowledge/decisions/security/nobody-signs-in.md. Bounded only so it cannot be
 * used to write an essay into an indexed column.
 */
export const AttendeeId = z.string().trim().min(1).max(64)

/**
 * 280 characters. A question that does not fit on the wall is a question the host
 * will not read out, so the limit is the projector's, not the database's.
 */
export const QuestionBody = z.string().trim().min(3).max(280)

/** One line, said in ten seconds, on a slide nobody has made yet. */
export const LightningTopic = z.string().trim().min(3).max(80)

export const TalkKind = z.enum(['talk', 'interlude'])

export const TalkSchema = z.object({
  id: z.string(),
  position: z.number().int(),
  timeLabel: z.string(),
  title: z.string(),
  speaker: z.string().nullable(),
  blurb: z.string().nullable(),
  kind: TalkKind,
  /** True for exactly one slot at a time. The room's whole sense of "where are we". */
  isCurrent: z.boolean(),
})

export const QuestionSchema = z.object({
  id: z.string(),
  body: z.string(),
  authorName: z.string(),
  votes: z.number().int(),
  /**
   * Whether THIS caller has already voted. Computed per request from the device id
   * they sent, so the board can show a cast vote as a filled control instead of
   * making them find out by being refused.
   */
  youVoted: z.boolean(),
  createdAt: z.string(),
})

export const LightningSlotSchema = z.object({
  id: z.string(),
  name: z.string(),
  topic: z.string(),
  /** Whether this row belongs to the caller — the only row they may withdraw. */
  isYours: z.boolean(),
})

/** ISO-8601 with milliseconds, which is how every timestamp in this app is stored. */
export const now = () => new Date().toISOString()

/**
 * `crypto.randomUUID` rather than an autoincrement: ids are generated before the
 * insert so a function can return the row it just wrote without a second query,
 * and they are opaque so nothing downstream can guess the next question's id.
 */
export const newId = () => crypto.randomUUID()
