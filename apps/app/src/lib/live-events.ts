import { useEffect, useRef } from 'react'
import { usePikkuRealtime } from '@pikku/react'
import type { PikkuRealtime } from '@project/functions-sdk/pikku/realtime.gen'
import type { MeetupLiveEvent } from '@project/functions-sdk/types'

/**
 * The room's push stream, seen from a phone.
 *
 * ONE WEBSOCKET FOR THE WHOLE APP, no matter how many components listen.
 *
 * This started as SSE and could not stay there — see
 * knowledge/decisions/the-room-pushes-over-a-websocket.md. The short version:
 * neither event hub this project actually runs on delivers to an SSE channel.
 *
 * Subscription is REFERENCE COUNTED. The first listener subscribes, the last one
 * unsubscribes, and everything in between shares one socket — so switching
 * between Tonight and Q&A does not tear down and reopen the connection. React
 * StrictMode's double-mount is handled by the same counting: mount, unmount,
 * mount leaves the count at one and the socket up.
 *
 * The generated client reconnects on its own with backoff and re-sends its
 * subscriptions, so a phone that loses signal in a basement venue rejoins the
 * room without anybody touching it.
 */

type Listener = (event: MeetupLiveEvent) => void

const listeners = new Set<Listener>()
let stream: { close: () => void } | null = null

function open(realtime: PikkuRealtime) {
  if (stream) {
    return
  }
  // No unwrapping here: the WebSocket client dispatches on the envelope's `topic`
  // and hands the handler `data` — the event itself. (The SSE client does NOT;
  // that asymmetry is written up in eventhub-topics.d.ts.)
  const off = realtime.subscribe('meetup-live', (event) => {
    // A handler that throws must not take down the delivery of the same event to
    // every other listener — one screen's render bug is not the whole room's
    // stream going quiet.
    for (const listener of [...listeners]) {
      try {
        listener(event)
      } catch {
        // Deliberately swallowed; the next event still arrives.
      }
    }
  })
  stream = { close: off }
}

function closeIfIdle() {
  if (listeners.size === 0 && stream) {
    stream.close()
    stream = null
  }
}

/**
 * Run `handler` for every live event, for as long as the component is mounted.
 *
 * The handler is held in a ref and read at call time, so a component may pass a
 * fresh closure on every render — the usual case, since handlers close over query
 * data — without resubscribing. Only mount and unmount touch the stream.
 */
export function useLiveEvents(handler: Listener): void {
  const realtime = usePikkuRealtime<PikkuRealtime>()
  const latest = useRef(handler)
  latest.current = handler

  useEffect(() => {
    const listener: Listener = (event) => latest.current(event)
    listeners.add(listener)
    open(realtime)
    return () => {
      listeners.delete(listener)
      closeIfIdle()
    }
  }, [realtime])
}
