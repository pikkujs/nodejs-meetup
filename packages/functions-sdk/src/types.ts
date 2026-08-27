import type { FlattenedRPCMap } from '../../functions/.pikku/rpc/pikku-rpc-wirings-map.gen.d.js'

export type { FlattenedRPCMap }

export type RPCInput<Name extends keyof FlattenedRPCMap> = FlattenedRPCMap[Name]['input']

export type RPCOutput<Name extends keyof FlattenedRPCMap> = FlattenedRPCMap[Name]['output']

export type { AnalyticsEvent } from '../../functions/src/__fabric_analytics__/registry.js'

export type {
  EventHubTopics,
  LiveQuestion,
  MeetupLiveEvent,
} from '../../functions/src/eventhub-topics.js'
