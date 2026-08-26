import { z } from 'zod'
import { pikkuScenarioStep } from '#pikku/scenarios'

export const TheWallShowsInput = z.object({
  /** The talk whose name should be at the top of the projection. */
  talkTitle: z.string(),
  /** The question expected first on the wall, matched as a substring. */
  topQuestion: z.string().optional(),
  /** How many questions the wall may show at once. Three, always. */
  atMost: z.number().int().default(3),
})

export const TheWallShowsOutput = z.object({
  talkTitle: z.string(),
  shown: z.number().int(),
  remaining: z.number().int(),
})

/**
 * Assert what the projector is showing.
 *
 * A separate step from `theBoardReads` because they are separate claims: the board is
 * every question in vote order, the wall is the top three of them plus a count of what
 * is behind. The gap between "the board says" and "the wall says" is exactly the bug
 * the room would notice and nobody else would.
 */
export const theWallShows = pikkuScenarioStep({
  name: 'theWallShows',
  actor: true,
  description: 'asserts what the projected stage view shows',
  template: 'the wall shows {topQuestion} under {talkTitle}',
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
