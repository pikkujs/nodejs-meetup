/**
 * Secrets this project reads that no scaffold declares for it.
 *
 * `auth.ts` reads `SCENARIO_ACTOR_SECRET`, so pikku requires a declaration for it
 * (PKU951) — without one, codegen fails and the dev server will not boot.
 *
 * It is `optional` because absence is a supported state: unset simply disables
 * `/api/auth/sign-in/actor` and the actor plugin refuses every sign-in. A deploy
 * that does not set it is a deploy with scenario sign-in off, not a broken one, so
 * the deploy gate must not demand a value.
 */
import { defineSecret } from '@pikku/core/secret'
import { z } from 'zod'

export const ScenarioActorSecretSchema = z.string()

defineSecret({
  name: 'scenarioActorSecret',
  displayName: 'Scenario Actor Secret',
  description: 'Signing key for /api/auth/sign-in/actor. Unset disables actor sign-in.',
  secretId: 'SCENARIO_ACTOR_SECRET',
  schema: ScenarioActorSecretSchema,
  optional: true,
})

/**
 * The one shared passcode that gates every organiser action —
 * knowledge/decisions/security/one-shared-passcode.md.
 *
 * NOT optional. An unset passcode is not "organiser mode off", it is a deploy
 * where nobody can advance the schedule in front of a room of forty people, and
 * that must fail at the deploy gate rather than at 19:20.
 *
 * Minimum eight characters because it is said out loud across a room, typed on a
 * phone in the dark, and shared by everyone at the front — it is a door code, and
 * it is held to a door code's standard, not a password's.
 */
export const OrganiserPasscodeSchema = z.string().min(8)

defineSecret({
  name: 'organiserPasscode',
  displayName: 'Organiser Passcode',
  description:
    'The shared passcode for /app/organiser. Everyone running the night types the same one; rotate it between meetups, never during one.',
  secretId: 'ORGANISER_PASSCODE',
  schema: OrganiserPasscodeSchema,
})

/**
 * The token the GitHub addon posts issues with.
 *
 * A secret rather than a variable because it is bearer material: anyone holding
 * it can write to the repo. It reaches the addon through `wire.setCredential`
 * in the queue wiring, not through a function reading it directly — see
 * src/queues/outbound.queue.ts.
 *
 * Optional, because the night runs fine without it. An unset token means the
 * github-issues worker discards its jobs with a reason in the log; it does not
 * mean a deploy that cannot start, and it must not fail the deploy gate for the
 * meetups that never wanted the issues in the first place.
 */
export const GithubTokenSchema = z.string().min(1)

defineSecret({
  name: 'githubToken',
  displayName: 'GitHub Token',
  description:
    'A token with `issues: write` on GITHUB_ISSUES_REPO. Unset turns the github-issues queue worker into a no-op.',
  secretId: 'GITHUB_TOKEN',
  schema: GithubTokenSchema,
  optional: true,
})
