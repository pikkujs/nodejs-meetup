import {
  FileScenarioRunStore,
  JsonConsoleLogger,
  LocalEmailService,
  LocalSecretService,
  LocalVariablesService,
  NoopAuditService,
  createInvocationAudit,
  type AgentRunnerService,
} from '@pikku/core/services'
import { LocalEventHubService } from '@pikku/core/channel/local'
import {
  KyselyVirtualUserRunStore,
  KyselyVirtualUserScheduleStore,
  createAuditedKysely,
} from '@pikku/kysely'
import { pikkuServices, pikkuWireServices } from '#pikku/setup'
import { TypedSecretService } from '../.pikku/secrets/pikku-secrets.gen.js'
import { TypedVariablesService } from '../.pikku/variables/pikku-variables.gen.js'
import { CFWorkerSchemaService } from '@pikku/schema-cfworker'
import type { Kysely } from 'kysely'
import { GeneratedTemplateEmailService } from './lib/email-service.js'
import { OrganiserGate } from './lib/organiser-gate.js'
import type { DB } from '#pikku/db/schema.gen.js'
import type { EventHubTopics } from './eventhub-topics.js'

export const createSingletonServices = pikkuServices(async (config, existingServices) => {
  const variables =
    existingServices?.variables ?? new TypedVariablesService(new LocalVariablesService())
  const secrets =
    existingServices?.secrets ?? new TypedSecretService(new LocalSecretService(variables))
  const logger = existingServices?.logger ?? new JsonConsoleLogger()
  const schema = existingServices?.schema ?? new CFWorkerSchemaService(logger)
  const emailService = new GeneratedTemplateEmailService({
    delegate: existingServices?.emailService ?? new LocalEmailService(),
  })
  const audit = existingServices?.audit ?? new NoopAuditService()
  const organiserGate = existingServices?.organiserGate ?? new OrganiserGate(secrets)
  const eventHub =
    existingServices?.eventHub ??
    new LocalEventHubService<EventHubTopics & Record<string, unknown>>()
  if (!existingServices?.kysely) {
    throw new Error('kysely service was not injected by the runtime (pikku dev / fabric)')
  }
  const kysely: Kysely<DB> = existingServices.kysely

  const scenarioRunsDir = process.env.SCENARIO_RUNS_DIR
  const scenarioRunStore = scenarioRunsDir
    ? new FileScenarioRunStore({ dir: scenarioRunsDir })
    : null

  const credentialService = existingServices?.credentialService

  const virtualUserRunStore =
    existingServices?.virtualUserRunStore ?? new KyselyVirtualUserRunStore(kysely as any)
  const virtualUserScheduleStore =
    existingServices?.virtualUserScheduleStore ?? new KyselyVirtualUserScheduleStore(kysely as any)

  const litellmProxyUrl = process.env.LITELLM_PROXY_URL ?? null
  const litellmApiKey = process.env.LITELLM_API_KEY ?? null
  let agentRunner: AgentRunnerService | undefined = existingServices?.agentRunner
  if (!agentRunner) {
    const aiVercel = await import('@pikku/ai-vercel')
    const aiSdk = await import('@ai-sdk/openai')
    if (aiVercel.VercelAgentRunner && aiSdk.createOpenAI) {
      let providers = {}
      if (litellmProxyUrl && litellmApiKey) {
        const provider = aiSdk.createOpenAI({
          name: 'litellm',
          baseURL: litellmProxyUrl,
          apiKey: litellmApiKey,
        })
        const litellm = {
          languageModel: (modelId: string) => provider.chat(modelId),
          transcription: (modelId: string) => provider.transcription(modelId),
          speech: (modelId: string) => provider.speech(modelId),
        }
        providers = { openai: litellm, anthropic: litellm, google: litellm, deepseek: litellm }
      }
      agentRunner = new aiVercel.VercelAgentRunner(providers)
    }
  }

  return {
    ...(existingServices ?? {}),
    config,
    variables,
    secrets,
    schema,
    logger,
    emailService,
    audit,
    organiserGate,
    eventHub,
    kysely,
    scenarioRunStore,
    virtualUserRunStore,
    virtualUserScheduleStore,
    agentRunner,
    ...(credentialService ? { credentialService } : {}),
  }
})

export const createWireServices = pikkuWireServices(async (singletonServices, wire) => {
  if (!singletonServices.audit) {
    return {}
  }
  const auditLog = createInvocationAudit(singletonServices.audit, wire)
  if (!auditLog.config) {
    return { auditLog }
  }
  return {
    auditLog,
    kysely: createAuditedKysely(singletonServices.kysely, { audit: auditLog }),
  }
})
