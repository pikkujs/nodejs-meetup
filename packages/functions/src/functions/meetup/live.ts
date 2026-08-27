import type { EventHubService } from '@pikku/core/channel'
import type { EventHubTopics, MeetupLiveEvent } from '../../eventhub-topics.js'

export const LIVE_TOPIC = 'meetup-live' as const

export async function publishLive(
  eventHub: EventHubService<EventHubTopics & Record<string, unknown>>,
  event: MeetupLiveEvent,
  logger?: { error: (message: string) => void },
): Promise<void> {
  try {
    await eventHub.publish(LIVE_TOPIC, null, { topic: LIVE_TOPIC, data: event } as never)
  } catch (error) {
    logger?.error(`meetup-live publish failed for ${event.kind}: ${String(error)}`)
  }
}
