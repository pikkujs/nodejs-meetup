---
type: decision
title: Live means polling, not websockets
description: Every live surface refetches on a timer. Now the safety net behind the websocket, not the mechanism.
tags: [decisions, architecture]
---

# Live means polling

> **Superseded in part.** Live surfaces are now pushed over a websocket — see
> [the room pushes over a websocket](the-room-pushes-over-a-websocket.md). The
> intervals below all still run, unchanged, as the fallback for a phone that
> missed a socket. What follows is why polling was chosen first, and why it
> stayed.

Every screen that has to stay current — the schedule, the Q&A board, the lightning
list, the projected stage view — refetches on an interval rather than holding a
websocket.

| Surface | Interval | Why that number |
|---|---|---|
| Stage (projector) | 3s | Nobody is touching it; it must never look stale to a room |
| Q&A board | 5s | Votes move while you are reading; slower than this feels broken |
| Schedule | 10s | Changes a handful of times all night |
| Lightning list | 10s | Changes a handful of times all night |

## Why not realtime, at first

Pikku has websockets and this app did not appear to need them. Forty phones on venue wifi,
polling a SQLite-backed read every few seconds, is a rounding error — and polling
degrades in exactly the way you want when the wifi is bad: a request is missed and
the next one catches up. A dropped socket needs reconnect logic, and reconnect
logic is what fails on a projector at 20:15 with nobody watching the console.

The cost is a few seconds of staleness on a board people read for a few seconds
at a time. That is not a cost — except on the vote counter, which is exactly
where it turned out to be one, and which is what the websocket now carries.

## What this rules out

- No presence, no "3 people are typing". Cross-client updates DO now arrive
  pushed; what polling alone ruled out was the vote landing on someone else's
  screen the moment it was cast.

Related: [milestone 03](../milestones/03-the-board-sorts-by-votes.md)
