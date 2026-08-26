---
type: decision
title: The room pushes over a websocket
description: Live surfaces are pushed over one websocket carrying one topic. Polling stayed on as the safety net.
tags: [decisions, architecture, realtime]
---

# The room pushes over a websocket

Votes, new questions, answered questions, schedule advances and lightning
changes are pushed to every phone and to the projector over a single websocket.
The polling in [live means polling](live-means-polling.md) is still there, at the
same intervals, but it is now the fallback rather than the mechanism.

## Why this changed

Polling was the right call for a schedule that moves a handful of times a night.
It was the wrong call for the vote counter, which is the one thing the room looks
at together. A number that climbs up to five seconds after the tap it belongs to
reads as broken, and a board that re-sorts on a timer re-sorts while somebody is
mid-sentence rather than when the vote lands. The demo is a room watching a
number move; the interval was the whole reason it did not.

## Websocket, not SSE

The generated realtime client offers both. SSE opens one `EventSource` **per
topic**, and a browser allows six concurrent HTTP/1.1 connections per origin, so
a handful of topics would starve the RPCs the same page still has to make — and
starve them by hanging rather than failing. The websocket multiplexes every topic
down one connection and leaves that budget alone.

There is also a framework reason: SSE on Bun did not work at all until
[pikkujs/pikku#1480](https://github.com/pikkujs/pikku/pull/1480). `subscribe`
looked the channel up by string id while the SSE stream had registered itself
under an object key, so the connection opened and stayed silent.

## One topic, not five

`meetup-live` carries a discriminated union rather than a topic per event kind.
Over a websocket narrow topics would be free, but keeping one topic means the SSE
transport stays viable as a fallback without the connection-limit problem above.
Every subscriber sees every event and discards what it does not need — at one
meetup's event rate, that is nothing. See
`packages/functions/src/eventhub-topics.d.ts`.

## What this rules out

- Nothing about the app is push-only. Every surface still refetches on its
  interval, so a phone that missed a socket or slept in a pocket is correct
  within seconds without reconnect logic having to be perfect.
- Per-caller state never travels in a payload. `youVoted` is yours alone, so a
  broadcast cannot carry it — the client keeps its own. See
  `apps/app/src/lib/apply-live.ts`.

Related: [live means polling](live-means-polling.md),
[the board is a queue](design/the-board-is-a-queue.md)
