import { defineVariable } from '@pikku/core/variable'
import { z } from 'zod'
import type { SingletonServices } from '#pikku/function'

export const OrganiserEmailSchema = z.string().email()
export const GithubIssuesRepoSchema = z.string().regex(/^[^/\s]+\/[^/\s]+$/)

defineVariable({
  name: 'organiserEmail',
  displayName: 'Organiser Email',
  description:
    'Where the per-talk question summary is sent after each slot closes. Unset skips the email.',
  variableId: 'ORGANISER_EMAIL',
  schema: OrganiserEmailSchema,
  optional: true,
})

defineVariable({
  name: 'githubIssuesRepo',
  displayName: 'GitHub Issues Repo',
  description:
    'owner/repo that unanswered questions are filed against, e.g. "pikkujs/nodejs-meetup". Unset skips the filing.',
  variableId: 'GITHUB_ISSUES_REPO',
  schema: GithubIssuesRepoSchema,
  optional: true,
})

export async function issuesRepo(
  variables: SingletonServices['variables'],
): Promise<{ owner: string; repo: string } | null> {
  const configured = await variables.get('GITHUB_ISSUES_REPO')
  if (!configured) {
    return null
  }
  const [owner, repo] = configured.split('/')
  if (!owner || !repo) {
    return null
  }
  return { owner, repo }
}
