import { z } from 'zod'

export const AttendeeName = z.string().trim().min(1).max(40)

export const AttendeeId = z.string().trim().min(1).max(64)

export const QuestionBody = z.string().trim().min(3).max(280)

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
  isCurrent: z.boolean(),
})

export const QuestionSchema = z.object({
  id: z.string(),
  body: z.string(),
  authorName: z.string(),
  votes: z.number().int(),
  youVoted: z.boolean(),
  createdAt: z.string(),
})

export const LightningSlotSchema = z.object({
  id: z.string(),
  name: z.string(),
  topic: z.string(),
  isYours: z.boolean(),
})

export const now = () => new Date().toISOString()

export const newId = () => crypto.randomUUID()

export const TalkJob = z.object({
  talkId: z.string(),
})
