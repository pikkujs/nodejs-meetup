---
type: entity
title: Talk
description: One slot on tonight's running order — including the ones nobody speaks at.
tags: [entities, schedule]
---

# Talk

A **talk** is one slot on tonight's running order. Doors, the intro, the break,
pizza and doors-closing are all talks too: the room experiences them as "what is
happening now", and a schedule that skips them lies about the evening between
19:50 and 20:00.

So a talk carries a **kind**:

- `talk` — someone is speaking, and it takes questions
- `interlude` — doors, intro, break, pizza, doors close. Real time, no speaker,
  and **no Q&A board** — see [the Q&A follows the current talk](../decisions/qa-follows-the-current-talk.md)

Exactly one talk is **current** at any moment, and the room's whole sense of
"where are we" hangs off that one pointer. It is moved by a person, not a clock —
see [the schedule is advanced by hand](../decisions/the-schedule-advances-by-hand.md).

A talk ends when the organiser advances past it. Nothing is deleted; the evening
is a fixed list written before doors open.

Related: [Question](question.md), [milestone 01](../milestones/01-tonights-schedule.md)
