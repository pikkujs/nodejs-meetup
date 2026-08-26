---
type: decision
title: The schedule advances by hand, not by clock
description: A person presses next. Nothing is driven by wall-clock time.
tags: [decisions, schedule]
---

# The schedule advances by hand

Tonight's running order has times on it — 19:00, 19:40, 20:20 — and the app shows
them. It does **not** use them.

The current talk moves when an organiser presses **Next**, and only then.

## Why

Meetups run late. They always run late. A clock-driven schedule would declare
talk two "on now" at 19:40 while the first speaker is still taking questions,
which means the Q&A board silently switches to a talk nobody is giving, and every
question posted in the next four minutes lands in the wrong place. The failure is
invisible until someone reads the board out loud.

A human pressing a button is right by definition: the schedule says what is
happening because the person running the night said so.

## What this rules out

- No "starting soon" countdown, no auto-advance, no cron, no scheduled job. If
  nobody presses the button the app cheerfully insists doors are still open at
  half nine, and that is the correct behaviour for a tool with one operator in
  the room.
- The printed times are **decoration and orientation** — never a source of truth.
  Nothing reads them back.

Related: [Talk](../entities/talk.md),
[milestone 05](../milestones/05-the-organiser-runs-the-night.md)
