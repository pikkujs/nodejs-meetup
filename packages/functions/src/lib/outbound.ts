import { defineVariable } from '@pikku/core/variable'
import { z } from 'zod'
import type { SingletonServices } from '#pikku/function'

/**
 * Where the night's outbound work is addressed to.
 *
 * Both of these are DEPLOYMENT facts, not code facts — which meetup, whose
 * inbox, whose repo — so they are variables read through the `variables`
 * service. Same reasoning as lib/cors-origins.ts: a deployed unit is a
 * Cloudflare Worker with no `process.env`, and reading it there yields
 * `undefined` in silence.
 *
 * Neither is a secret. An email address and a repo slug are both public by the
 * time the work lands; the only bearer material in this path is GITHUB_TOKEN,
 * and that is declared in src/secrets.ts.
 */

// The CLI requires `schema` to be a named export, not an inline `z.string()`.
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

/**
 * Split `owner/repo` into the two arguments the GitHub addon actually takes.
 *
 * Returns `null` rather than throwing on absence or a malformed value: this is
 * read inside a queue worker, and a meetup that never configured a repo should
 * see the job discarded with a reason, not retried five times against nothing.
 */
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
