---
type: decision
title: Live means polling, not websockets
description: Every live surface refetches on a timer. Chosen over realtime for one night in one room.
tags: [decisions, architecture]
---

# Live means polling

Every screen that has to stay current — the schedule, the Q&A board, the lightning
list, the projected stage view — refetches on an interval rather than holding a
websocket.

| Surface | Interval | Why that number |
|---|---|---|
| Stage (projector) | 3s | Nobody is touching it; it must never look stale to a room |
| Q&A board | 5s | Votes move while you are reading; slower than this feels broken |
| Schedule | 10s | Changes a handful of times all night |
| Lightning list | 10s | Changes a handful of times all night |

## Why not realtime

Pikku has websockets and this app does not need them. Forty phones on venue wifi,
polling a SQLite-backed read every few seconds, is a rounding error — and polling
degrades in exactly the way you want when the wifi is bad: a request is missed and
the next one catches up. A dropped socket needs reconnect logic, and reconnect
logic is what fails on a projector at 20:15 with nobody watching the console.

The cost is a few seconds of staleness on a board people read for a few seconds
at a time. That is not a cost.

## What this rules out

- No push, no optimistic cross-client updates, no presence, no "3 people are
  typing". A vote you cast appears instantly for you (the mutation invalidates the
  query); it appears for everyone else within the interval.

Related: [milestone 03](../milestones/03-the-board-sorts-by-votes.md)
