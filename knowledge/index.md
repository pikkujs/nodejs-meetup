---
type: Overview
title: Node.js Meetup — tonight
description: A phone-first app for running one Node.js meetup, on one night, in one room.
tags: [meta, okf]
---

# Node.js Meetup — tonight

One meetup. One night. One room. This app exists between doors opening at 19:00
and doors closing at 21:40, and it is deliberately useless afterwards.

## What it is

Forty people in a room with the lights down. Three things they need:

1. **Where are we?** — tonight's running order, with what is on right now at the
   top of it. Advanced by a person, never by a clock.
2. **What should we ask?** — a Q&A board scoped to the current talk, sorted by
   votes, so the top row is the next question the host asks out loud.
3. **Who is doing a lightning talk?** — a sign-up sheet anyone can add themselves
   to, in the order they signed up.

Plus the front of the room: an organiser screen behind one shared passcode, a
projected big-screen view of the top three questions, and a projected QR code so
nobody has to type a URL in the dark.

## The two shapes that define everything else

- **[Nobody signs in.](decisions/security/nobody-signs-in.md)** An attendee is a
  name they typed once and a device id their browser made up. The server trusts
  neither.
- **[One shared passcode](decisions/security/one-shared-passcode.md)** gates every
  organiser action, enforced as a permission on the function — not as a screen
  that is missing from the nav.

## Explicitly out of scope

Ticketing. Payments. Accounts. Past events. Anything about a second meetup.

## Sections

- [Milestones](milestones/index.md) — the buildable pieces, in build order
- [Entities](entities/index.md) — talk, question, lightning slot, attendee
- [Decisions](decisions/index.md) — including [security](decisions/security/index.md)
  and [design](decisions/design/index.md)
- [Questions](questions/index.md) — asked-by-assumption, never answered
- [Wishlist](wishlist/index.md) — noticed, not asked for, not built

## Format

Open Knowledge Format (OKF) v0.1, Fabric profile: one markdown note per idea,
YAML frontmatter, `type` required, the path is the identity. Cross-links are what
make it a graph. Never record what `pikku info` / `pikku meta` can already tell
you — tables, routes, function signatures and permissions are discoverable, and a
copy of them here would be a copy that goes stale.

<!-- pikku:knowledge-index -->
- [decisions](decisions/index.md) — a rule that was chosen, and what it rules out
- [entities](entities/index.md) — a thing the app is about, in the language users use for it
- [milestones](milestones/index.md) — one buildable piece of the app, with the scenario that proves it
- [questions](questions/index.md) — something asked and not yet answered
- [wishlist](wishlist/index.md) — something wanted that nobody has asked to be built
<!-- /pikku:knowledge-index -->
