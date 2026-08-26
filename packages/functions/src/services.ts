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
  // The template renderer ALWAYS wraps, and the host's service becomes its
  // delegate rather than replacing it. Taking `existingServices.emailService`
  // whole — the obvious `?? new Generated...` — is why the talk-summary email
  // arrived in `pikku dev` as a template NAME and a data blob: the dev server
  // injects a bare LocalEmailService, that won, and nothing ever rendered the
  // handlebars. Wrapping keeps whatever the host configured as the transport
  // (a relay in a deployed stage, the console locally) and puts the rendering
  // in front of it, which is where it belongs.
  const emailService = new GeneratedTemplateEmailService({
    delegate: existingServices?.emailService ?? new LocalEmailService(),
  })
  // The durable audit sink. In a deployed stage fabric injects the platform's
  // audit service; locally it falls back to a no-op so nothing is persisted.
  const audit = existingServices?.audit ?? new NoopAuditService()
  // The organiser passcode check. Constructed here — not inside the permission —
  // because a pikkuPermission is handed SecretlessServices and cannot reach the
  // secret store by design. See lib/organiser-gate.ts.
  const organiserGate = existingServices?.organiserGate ?? new OrganiserGate(secrets)
  // The push channel behind /events/meetup-live.
  //
  // `existingServices` WINS: a deployed fabric stage injects the hub that matches
  // its topology (Cloudflare's, backed by a Durable Object), and that is the one
  // that can fan a vote out to phones held by two different instances. The local
  // fallback is in-process and correct for exactly one process — which is `pikku
  // dev`, the scenario runner, and a single Worker. Scale past one instance
  // without an injected hub and half the room stops updating, so the fallback is
  // a development convenience, never a deployment strategy.
  const eventHub =
    existingServices?.eventHub ??
    new LocalEventHubService<EventHubTopics & Record<string, unknown>>()
  // kysely is injected by pikku dev (node:sqlite) or the CF Worker workflow (libsql).
  // The template never constructs its own dialect — dialects are fabric/runtime
  // concerns — so it must always be provided by the runtime.
  if (!existingServices?.kysely) {
    throw new Error('kysely service was not injected by the runtime (pikku dev / fabric)')
  }
  const kysely: Kysely<DB> = existingServices.kysely

  // Per-user credential store (wire.getCredential) — needed by addons imported
  // with --auth per-user/delegated. A deployed stage injects it: credentials are
  // sealed to the stage, and only its secrets Worker holds the key. There is no
  // fallback because there is no key to fall back to — the template used to
  // build a `KyselyCredentialService` from a `CREDENTIALS_KEY` secret, which was
  // the stage's own KEK handed to every unit. Outside a stage the app runs fine
  // and credential-using addon calls fail with a clear error from the addon's
  // wire services; wire your own `credentialService` here if you need one.
  const credentialService = existingServices?.credentialService

  const litellmProxyUrl = process.env.LITELLM_PROXY_URL ?? null
  const litellmApiKey = process.env.LITELLM_API_KEY ?? null
  let aiAgentRunner: VercelAgentRunner | undefined
  if (litellmProxyUrl && litellmApiKey) {
    // The AI SDKs (~3MB) are stubbed out of non-agent units at bundle time —
    // only units with the `ai-model` capability keep them. So import them
    // dynamically and guard on the module resolving to a real export; in a
    // stubbed unit the import yields `{}` and the runner is simply not built.
    const aiVercel = await import('@pikku/ai-vercel')
    const aiSdk = await import('@ai-sdk/openai')
    if (aiVercel.VercelAgentRunner && aiSdk.createOpenAI) {
      const provider = aiSdk.createOpenAI({
        name: 'litellm',
        baseURL: litellmProxyUrl,
        apiKey: litellmApiKey,
      })
      // Every provider name maps to the one proxy — the vendor is chosen by the
      // model id on the other side, so these differ only in the prefix a caller
      // writes (`openai/gpt-5`, `deepseek/deepseek-v4-pro`).
      //
      // Each entry must be a NON-CALLABLE OBJECT with explicitly named methods,
      // because VercelAgentRunner.getModel resolves the shapes differently:
      //
      // - a callable provider takes the `language` fast path — `provider(modelId)` —
      //   which in @ai-sdk/openai v3 is the RESPONSES api (`/v1/responses`), not
      //   chat. Our LiteLLM entries are all `mode: chat`, so that hands a Chat
      //   Completions stream to a Responses parser and dies.
      // - a plain function satisfies `language` and NOTHING else, so
      //   `aiAgentRunner.transcribe` / `.generateSpeech` fail with "Provider
      //   'openai' does not support transcription models". That is what this
      //   shape replaces: audio was unreachable from a stock sandbox even though
      //   the proxy has routed STT/TTS all along.
      //
      // `.transcription` / `.speech` reach the proxy's `audio_transcription` /
      // `audio_speech` entries (whisper-large-v3-turbo, kokoro-82m).
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
  // auditLog is ALWAYS injected, but `auditLog.write(...)` only PERSISTS when this
  // function set `audit: true` — createInvocationAudit gates on wire.audit, so
  // without it write() is a warn-only no-op (see @pikku/core audit-service.ts).
  // `auditLog.config` is set ONLY when audit: true is on, and when it is, ALSO wrap
  // kysely so every query is captured and the runner flushes the buffer on close.
  // Without audit: true, leave the plain kysely untouched — no per-query overhead.
  if (!auditLog.config) {
    return { auditLog }
  }
  return {
    auditLog,
    kysely: createAuditedKysely(singletonServices.kysely, { audit: auditLog }),
  }
})
