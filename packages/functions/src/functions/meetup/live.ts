import type { EventHubService } from '@pikku/core/channel'
import type { EventHubTopics, MeetupLiveEvent } from '../../eventhub-topics.js'

/** The one topic. See eventhub-topics.d.ts for why there is only one. */
export const LIVE_TOPIC = 'meetup-live' as const

/**
 * Push one change to everyone watching.
 *
 * Three things this wrapper exists to get right in one place:
 *
 * 1. THE ENVELOPE. `eventHub.publish` takes the raw payload, but the generated
 *    client dispatches on a `topic` field — a bare payload arrives at the browser
 *    and no handler fires. That is a silent failure with a working connection, so
 *    the envelope is built here rather than remembered at five call sites.
 *
 * 2. THE SKIP ARGUMENT IS `null`. The middle parameter is the channel to EXCLUDE,
 *    not the one to send to. `null` means everyone. Excluding the originator
 *    would be right if the caller had already applied the change locally, but
 *    here the caller is an HTTP request with no channel of its own — the phone
 *    that cast the vote is watching on a SEPARATE SSE connection, and skipping
 *    would be skipping a stranger.
 *
 * 3. IT NEVER THROWS. A failed publish must not fail the write that caused it.
 *    The vote is already committed; if the fan-out dies, the correct outcome is a
 *    room that updates on the next poll, not an error toast on a phone whose vote
 *    actually counted. Logged, not raised.
 */
export async function publishLive(
  eventHub: EventHubService<EventHubTopics & Record<string, unknown>>,
  event: MeetupLiveEvent,
  logger?: { error: (message: string) => void },
): Promise<void> {
  try {
    // The cast is the framework's asymmetry, not sloppiness on our side: the hub
    // types its payload as what a WEBSOCKET SUBSCRIBER receives (the bare event),
    // while the wire format a publisher must send is the envelope the client
    // dispatches on. There is no type that is honest about both ends, so the one
    // place that bridges them is here, named and explained, rather than spread
    // across five call sites.
    await eventHub.publish(LIVE_TOPIC, null, { topic: LIVE_TOPIC, data: event } as never)
  } catch (error) {
    logger?.error(`meetup-live publish failed for ${event.kind}: ${String(error)}`)
  }
}
