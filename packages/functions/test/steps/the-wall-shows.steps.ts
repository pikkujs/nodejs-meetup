import { z } from 'zod'
import { pikkuScenarioStep } from '#pikku/scenarios'

export const TheWallShowsInput = z.object({
  talkTitle: z.string(),
  topQuestion: z.string().optional(),
  atMost: z.number().int().default(3),
})

export const TheWallShowsOutput = z.object({
  talkTitle: z.string(),
  shown: z.number().int(),
  remaining: z.number().int(),
})

export const theWallShows = pikkuScenarioStep({
  name: 'theWallShows',
  actor: true,
  description: 'asserts what the projected stage view shows',
  template: 'sees the wall show {topQuestion} under {talkTitle}',
  input: TheWallShowsInput,
  output: TheWallShowsOutput,
  default: async (_services, { talkTitle, topQuestion, atMost }, { actor }) => {
    const stage = await actor.invoke('getStageView', {})

    if (!stage.currentTalk.title.includes(talkTitle)) {
      throw new Error(
        `Expected the wall to be headed "${talkTitle}", but it reads "${stage.currentTalk.title}".`,
      )
    }

    const bodies = stage.topQuestions.map((question) => question.body)

    if (bodies.length > atMost) {
      throw new Error(
        `The wall is showing ${bodies.length} questions. At more than ${atMost} the type has ` +
          `to shrink below what the back row can read — see knowledge/milestones/06-the-big-screen.md.`,
      )
    }

    if (topQuestion !== undefined && !(bodies[0] ?? '').includes(topQuestion)) {
      throw new Error(
        `Expected "${topQuestion}" first on the wall, but it reads: ${JSON.stringify(bodies)}.`,
      )
    }

    return {
      talkTitle: stage.currentTalk.title,
      shown: bodies.length,
      remaining: stage.remaining,
    }
  },
})
