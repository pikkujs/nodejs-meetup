---
type: decision
title: The attendee API is public, deliberately
description: Eight functions are exposed with no permission and no session. Why that is the design, and what it costs.
tags: [decisions, security]
---

# The attendee API is public

Eight functions carry `expose: true`, `auth: false` and no `permissions` block:

`listSchedule`, `listQuestions`, `askQuestion`, `upvoteQuestion`,
`listLightningSlots`, `signUpForLightning`, `withdrawLightningSlot`, `getStageView`.

`pikku all` reports this as **PKU574** on every build:

> 8 exposed sessionless functions carry no permission and no addon gate, so they are
> reachable by anyone through `POST /rpc/:rpcName`.

That is accurate, and it is the intended design. Nobody signs in
([nobody signs in](nobody-signs-in.md)), so there is no session to check and no
permission that could be written which would not be a lie — a `pikkuPermission`
reading a device id would be asserting that a self-declared string means something.

## What an anonymous caller can actually do

- **Read the schedule, the board, the list and the stage view.** All four are on a
  wall in the same room. There is nothing here that is not already projected.
- **Post a question under any name.** So can anyone holding a phone. The
  countermeasure is the organiser, who marks it answered and it disappears — which is
  the same countermeasure as for someone shouting.
- **Vote once per device id.** Sending a fresh id each time defeats it. This is
  accepted: see [the board is a queue](../design/the-board-is-a-queue.md). The cost of
  a rigged vote is that the host reads out a question they would not have; the cost of
  requiring accounts is that nobody asks anything.
- **Take their own name off the lightning list.** Or, with a guessed device id,
  somebody else's. Device ids are `randomUUID`; guessing one is not a threat model,
  it is a hobby.

## What it does NOT include

Everything that changes what the room sees is behind the passcode —
`advanceSchedule`, `markQuestionAnswered`, `checkOrganiserPasscode` — enforced in the
`permissions` field, not in a function body, and proven by
`thePasscodeIsTheGateScenario`. The line is drawn at *authorship* versus *authority*:
anyone may add to the board, only the organiser may change what is on stage.

## Why the warning is not silenced

`selfAuthenticated: true` is documented in core's own knowledge base as the opt-out
for exactly this case, and is **not implemented** in `@pikku/core@0.12.94` /
`@pikku/cli@0.12.119`. So the warning stays on every build. That is tolerable for one
night; if this app grew a second event it should be revisited, because a warning
nobody can act on is a warning everybody learns to scroll past.

Related: [one shared passcode](one-shared-passcode.md),
[nobody signs in](nobody-signs-in.md)
