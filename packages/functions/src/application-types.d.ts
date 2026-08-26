import type {
  CoreServices,
  CoreSingletonServices,
  CoreConfig,
  CoreUserSession,
} from '@pikku/core/types'
import type { AuditLog, EmailService } from '@pikku/core/services'
import type { Kysely } from 'kysely'
import type { DB } from '#pikku/db/schema.gen.js'
import type { TypedSecretService } from '../.pikku/secrets/pikku-secrets.gen.js'
import type { TypedVariablesService } from '../.pikku/variables/pikku-variables.gen.js'
import type { EventHubService } from '@pikku/core/channel'
import type { auth } from './auth.js'
import type { EventHubTopics } from './eventhub-topics.js'
import type { OrganiserGate } from './lib/organiser-gate.js'

export interface UserSession extends CoreUserSession {
  userId: string
}

export interface Config extends CoreConfig {
  port: number
  hostname: string
}

export interface SingletonServices extends CoreSingletonServices<Config> {
  variables: TypedVariablesService
  secrets: TypedSecretService
  kysely: Kysely<DB>
  // Lazy Better Auth factory, injected by the generated pikkuServices wrapper.
  // MUST be the factory shape `() => Promise<AuthInstance>` to satisfy
  // CoreSingletonServices['auth'] — call it (`await services.auth()`) to get
  // better-auth's full server `api`/`handler` surface; it memoises on first call.
  auth: () => Promise<Awaited<ReturnType<typeof auth>>>
  // Always constructed in services.ts, so declare it REQUIRED here — it is
  // optional in CoreSingletonServices, which otherwise makes every emailService
  // use read as possibly-undefined and forces needless `!`/guards in functions.
  emailService: EmailService
  // Per-invocation audit log, ALWAYS returned from createWireServices (see
  // services.ts) so general activity logging is available in every function —
  // `await auditLog.write({ type, source: 'explicit', metadata })`. Declared
  // REQUIRED (like emailService above) so a plain `auditLog.write(...)` doesn't
  // read as possibly-undefined and force needless `?.`/guards. A function with
  // `audit: true` ADDITIONALLY gets a kysely wrapped to capture every table write.
  auditLog: AuditLog
  // Answers one question — "is this the organiser passcode?" — for the permission
  // that gates every organiser function. Required, like emailService above: it is
  // always constructed in services.ts, and an optional declaration would force a
  // needless guard inside an authorization check, which is the last place to be
  // writing `?.`.
  organiserGate: OrganiserGate
  // The room's push channel. `CoreSingletonServices` declares eventHub optional,
  // which would put a `?.` on every publish — and a publish that silently does
  // nothing is exactly the bug you cannot see from the stage. It is always
  // constructed in services.ts, so it is REQUIRED here and a missing hub is a
  // boot failure rather than a wall that quietly stops updating.
  //
  // Widened with an index signature ON PURPOSE, and only here. The generated
  // realtime scaffold (`scaffold/realtime/events.gen.ts`) hands the hub a
  // `topic: string` straight off the wire — it cannot know this project's topic
  // names — so a hub typed to the literal union rejects generated code that must
  // not be hand-edited. Widening the SERVICE keeps the generated channel
  // compiling; `EventHubTopics` itself stays strict, which is what the browser
  // client is typed against, and every publish in this codebase goes through
  // `publishLive` whose own signature is the literal union. Typo protection
  // therefore lives at the one call site that publishes, not on the transport.
  eventHub: EventHubService<EventHubTopics & Record<string, unknown>>
}

export interface Services extends CoreServices<SingletonServices> {}
