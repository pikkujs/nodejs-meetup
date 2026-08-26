---
type: entity
title: Attendee
description: A person in the room. Never signs in — a name typed once, and a browser that remembers it.
tags: [entities, identity]
---

# Attendee

An **attendee** is a person in the room. They do not have an account and never
will — see [nobody signs in](../decisions/security/nobody-signs-in.md).

They are two things:

- a **name** they typed once, which the app shows next to what they post
- a **device id**, generated in their browser the first time they open the app
  and kept there

The device id is not a secret and proves nothing. It exists to answer exactly two
questions the room needs answered: *have you already voted on this?* and *is this
your lightning slot to withdraw?* Someone determined to vote twice can clear
their browser and do it — that is the honest cost of no login, it is written down
rather than pretended away, and for one night in one room it is the right trade.

An attendee has no server-side existence at all until they post something. There
is no attendee table.

Related: [Question](question.md), [Lightning slot](lightning-slot.md)
