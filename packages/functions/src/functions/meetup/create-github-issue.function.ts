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
  created: z.boolean(),
})

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
