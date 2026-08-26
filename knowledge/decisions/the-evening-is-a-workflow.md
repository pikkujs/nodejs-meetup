---
type: decision
title: The evening is a workflow, and the clock is a suggestion
description: A durable workflow walks the schedule and queues each talk's outbound work. It never outranks the person holding the microphone.
tags: [decisions, architecture, workflow, queue]
---

# The evening is a workflow, and the clock is a suggestion

`runTheMeetup` is a durable workflow that walks tonight's slots in order: put a
slot on stage, wait out its clock, and — for a talk, not an interlude — close
it, which queues a summary email to the organiser and a GitHub issue for every
question the host did not get to.

A scheduled task starts it at 18:30 on a Thursday. `startMeetupRun`, behind the
organiser passcode, starts the same workflow now with slot durations measured in
seconds, which is the only way to show a whole evening to somebody who is
standing there watching.

## Why a workflow and not a timer

The waiting is the hard part. A talk is twenty-five minutes, and a `setInterval`
holding a process open for twenty-five minutes is a process that cannot be
deployed over, cannot be scaled to zero, and loses the evening if it restarts.

Every step here is persisted before it runs and its result recorded after. A
crash between two talks resumes at the talk it was on. The sleeps cost nothing
while they are happening, because nothing is happening.

The body is written in the subset the inspector allows (PKU641): `const`/`let`,
`if`/`else`, `switch`, `for..of`, `return`, `throw`, workflow calls, and an
input parameter that is named rather than destructured. It is analysed into a
graph before it runs, so a `while` loop fails the build rather than the night.

**An `if` inside the `for..of` is silently dropped from that graph.** Not
rejected — dropped: the branch and everything in it simply is not in the
workflow, `pikku all` says nothing, and the first sign is a step the runner
cannot find. That is why the loop closes every slot unconditionally and
`closeSlot` decides whether a slot is a talk. Anything conditional belongs in a
function, not in the workflow body, until this is fixed upstream. The same goes
for mutating a hoisted array inside the loop — the graph records the variable
and never the push.

Read the generated graph after touching a workflow —
`packages/functions/.pikku/workflow/meta/runTheMeetup.gen.json` — and check
every step you wrote is a node in it. A missing `next` on a node is the tell.

## It does not own the schedule

This is the important half, and it is the same rule as
[the schedule advances by hand](the-schedule-advances-by-hand.md). The workflow
writes `eventState.currentTalkId`; so does `advanceSchedule`, which is the
organiser's Next button. Last write wins, and there is no lock.

So a host who is running ten minutes late presses Next, and the workflow's next
step moves the room on from wherever it now is. The workflow is a very
well-informed suggestion about when things should happen. A person with a
microphone outranks it, always, and nothing in the code needs to know that
because nothing in the code can prevent it.

## Why the outbound work goes on a queue

Sending an email and opening a dozen GitHub issues are the two slowest things
this app does and the two least urgent — the talk they belong to has just ended,
and nobody in the room is waiting. Putting them on a queue means GitHub being
down at 19:40 costs a retry at 19:45 and nothing else.

Two queues, not one worker doing both: they fail for unrelated reasons, and a
missing GitHub token must not cost the host their email.

The job payload is the talk id and nothing more. A job can sit through a retry
and run minutes after it was enqueued, and the right summary is the one true
when it *runs* — a host who marked two more questions answered in the meantime
should change the email, not be overwritten by a snapshot.

## What this rules out

- **Two meetups at once.** There is one `eventState` row, one current slot, one
  running order. A second concurrent run just advances the same room faster.
- **The workflow as a source of truth for "what time is it".** It knows what it
  scheduled, not what happened. Ask `listSchedule`.
- **Exactly-once issues.** A partial failure retries the whole talk, and
  questions already filed are filed again. A duplicate issue is cheap; a lost
  question is the thing this exists to prevent.
