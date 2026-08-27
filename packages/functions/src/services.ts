import {
  JsonConsoleLogger,
  LocalEmailService,
  LocalSecretService,
  LocalVariablesService,
  NoopAuditService,
  createInvocationAudit,
} from '@pikku/core/services'
import { LocalEventHubService } from '@pikku/core/channel/local'
import { createAuditedKysely } from '@pikku/kysely'
import { pikkuServices, pikkuWireServices } from '#pikku/setup'
import { TypedSecretService } from '../.pikku/secrets/pikku-secrets.gen.js'
import { TypedVariablesService } from '../.pikku/variables/pikku-variables.gen.js'
import { CFWorkerSchemaService } from '@pikku/schema-cfworker'
import type { Kysely } from 'kysely'
import type { VercelAgentRunner } from '@pikku/ai-vercel'
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

  const credentialService = existingServices?.credentialService

  const litellmProxyUrl = process.env.LITELLM_PROXY_URL ?? null
  const litellmApiKey = process.env.LITELLM_API_KEY ?? null
  let aiAgentRunner: VercelAgentRunner | undefined
  if (litellmProxyUrl && litellmApiKey) {
    const aiVercel = await import('@pikku/ai-vercel')
    const aiSdk = await import('@ai-sdk/openai')
    if (aiVercel.VercelAgentRunner && aiSdk.createOpenAI) {
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
      aiAgentRunner = new aiVercel.VercelAgentRunner({
        openai: litellm,
        anthropic: litellm,
        google: litellm,
        deepseek: litellm,
      })
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
    ...(credentialService ? { credentialService } : {}),
    ...(aiAgentRunner ? { aiAgentRunner } : {}),
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
