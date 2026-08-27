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
import type { ScenarioRunStore } from '@pikku/core/scenario'
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
  auth: () => Promise<Awaited<ReturnType<typeof auth>>>
  emailService: EmailService
  auditLog: AuditLog
  organiserGate: OrganiserGate
  eventHub: EventHubService<EventHubTopics & Record<string, unknown>>
  scenarioRunStore: ScenarioRunStore | null
}

export interface Services extends CoreServices<SingletonServices> {}
