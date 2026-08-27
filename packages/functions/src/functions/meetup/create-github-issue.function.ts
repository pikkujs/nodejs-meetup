import { z } from 'zod'
import { pikkuSessionlessFunc } from '#pikku/function'

export const CreateGithubIssueInput = z.object({
  owner: z.string(),
  repo: z.string(),
  title: z.string(),
  body: z.string(),
  labels: z.array(z.string()).optional(),
})

export const CreateGithubIssueOutput = z.object({
  /** False for as long as this is the stand-in rather than a real API call. */
  created: z.boolean(),
})

/**
 * Where an issue WOULD be opened. It opens none.
 *
 * This stands in for `github:issuesCreate` from `@pikku/addon-github`, which
 * this project no longer wires. The addon registers all 811 of its functions
 * and 1,416 of its schemas at module top level, and evaluating that costs more
 * than Cloudflare's startup CPU budget allows — the queue worker that called it
 * failed to start at all (pikkujs/pikku#1497).
 *
 * A no-op rather than a deleted path, deliberately. `closeSlot` still enqueues,
 * the `github-issues` worker still runs, the workflow still records the handoff
 * and the scenario still walks through both queue workers — so the shape that
 * comes back when the addon is fixed, or when this grows a direct `fetch`, is
 * the shape that is under test tonight. Deleting the path would have meant
 * rebuilding and re-testing it later, against a demo deadline that had passed.
 *
 * It logs at info per issue because that log IS the demo: it names the question
 * that ran out of time and the repo it was headed for, which is the whole point
 * being made from the stage.
 */
export const createGithubIssue = pikkuSessionlessFunc({
  auth: false,
  description: 'Stand-in for GitHub issue creation — logs the issue it would have opened.',
  input: CreateGithubIssueInput,
  output: CreateGithubIssueOutput,
  func: async ({ logger }, { owner, repo, title }) => {
    logger.info(`github-issues: would open "${title}" on ${owner}/${repo}`)
    return { created: false }
  },
})
