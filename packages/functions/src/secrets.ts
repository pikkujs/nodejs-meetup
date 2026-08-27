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

export const OrganiserPasscodeSchema = z.string().min(8)

defineSecret({
  name: 'organiserPasscode',
  displayName: 'Organiser Passcode',
  description:
    'The shared passcode for /app/organiser. Everyone running the night types the same one; rotate it between meetups, never during one.',
  secretId: 'ORGANISER_PASSCODE',
  schema: OrganiserPasscodeSchema,
})

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

export const OpenaiApiKeySchema = z.string().min(1)

defineSecret({
  name: 'openaiApiKey',
  displayName: 'OpenAI API Key',
  description:
    'Drives virtual user runs. Unset locally leaves the agent runner without a provider; a deployed stage is handed one by Fabric.',
  secretId: 'OPENAI_API_KEY',
  schema: OpenaiApiKeySchema,
  optional: true,
})
