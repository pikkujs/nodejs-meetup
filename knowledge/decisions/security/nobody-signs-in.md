---
type: decision
title: Nobody signs in
description: The attendee surface is fully public. Identity is a name in localStorage and nothing more.
tags: [decisions, security, identity]
---

# Nobody signs in

Every attendee-facing function is public: no session, no account, no email, no
password. An attendee is a name they typed once plus a device id their browser
generated — both stored in `localStorage`, both untrusted by the server.

## Why

The room has forty people in it and the talk starts in six minutes. An account
is a signup form, an email round-trip and a password nobody will remember, in
exchange for identity guarantees this app has no use for. Ticketing, payments and
accounts are explicitly out of scope for this build.

## What the server therefore assumes

**Nothing.** Specifically:

- The `attendeeId` on a request is a **claim, not a credential**. It dedupes
  votes and gates "withdraw my own lightning slot". It protects nothing valuable
  and is not treated as though it does.
- Anyone who clears their browser storage gets a fresh identity and can vote
  again. This is a known, accepted, written-down property.
- The display name is arbitrary user text. It is stored and rendered as text,
  never as markup, and it is length-capped so nobody can push the projected view
  off the wall.

## What this rules out

- No per-person history, no "my questions", no moderation-by-author, no analytics
  that need a stable person.
- **Better Auth stays wired but unused by the product.** It remains in the
  project because pikku's scenario actors sign in through it — the test harness
  needs real sessions even where the app does not. No screen in this app offers a
  login, and the shipped signup/login/account screens were deleted.

Related: [Attendee](../../entities/attendee.md),
[one shared passcode](one-shared-passcode.md)
