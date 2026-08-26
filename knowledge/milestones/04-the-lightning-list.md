---
type: milestone
title: The lightning list
description: A sign-up sheet on a wall. Anyone adds themselves; you may withdraw your own.
status: built
entities: [lightning-slot]
tags: [milestones, lightning]
---

# 04 — The lightning list

The 20:20 slot needs speakers and nobody knows who they are until about 20:05.
Anyone in the room adds their name and a one-line topic; the list is in sign-up
order, and that is the running order.

Nothing about this is gated. That is the point — see
[Lightning slot](../entities/lightning-slot.md).

## What it takes

- `lightning_slot` table — name, topic, attendee_id, created_at
- `signUpForLightning` — public. Refuses a second slot from the same device
- `withdrawLightningSlot` — public, and only for the device that created it
- `listLightningSlots` — public, readonly, in sign-up order
- `/app/lightning` — the list, the sign-up form, and a withdraw control on your
  own row only

## What proves it

```gherkin
Feature: Signing up for a lightning talk
  Scenario: Anyone can put their name down
    When 'marco' signs up to talk about bun test runners
    Then his name is on the lightning list in the order he signed up

  Scenario: You can only withdraw your own
    Given 'marco' has signed up for a lightning talk
    Then 'priya' is not offered a way to withdraw his slot
    And 'marco' can withdraw his own
```

Related: [Attendee](../entities/attendee.md)
