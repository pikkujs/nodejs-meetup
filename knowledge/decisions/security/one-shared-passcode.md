---
type: decision
title: One shared passcode gates every organiser action
description: A capability check in the permissions field, not a login. The passcode is the credential.
tags: [decisions, security, organiser]
---

# One shared passcode

Advancing the schedule and marking a question answered are gated on a single
shared passcode, held in the `ORGANISER_PASSCODE` secret. The organiser types it
once on `/app/organiser`; the browser keeps it and sends it with every organiser
call.

It is enforced as a **permission on the function** —
`permissions: { organiser: hasOrganiserPasscode }` — never as a check in the
function body, and never as "the screen isn't in the nav". A permission is
declared, inspectable by `pikku info permissions`, and applies identically to the
UI, to `curl`, and to `POST /rpc/:rpcName`.

The comparison is length-checked and constant-time, and a wrong passcode is
refused with the same message as a missing one.

## Why a passcode and not an account

There is one organiser role and it is held by whoever is standing at the front.
Sometimes that is two people, and the second one is holding the laptop. An
account would mean provisioning a person before an event that starts in six
minutes; a passcode is a thing you say out loud to a colleague.

## What this rules out

- **No audit trail of who did what.** Every organiser action is attributable to
  "someone who knew the passcode". For a three-talk evening that is fine; for a
  conference it would not be.
- **The passcode cannot be rotated mid-event** without every organiser device
  re-entering it. Rotate it between meetups, not during one.
- It is a shared secret in a browser's `localStorage`, so an organiser's unlocked
  phone is an organiser. Accepted: so is the laptop it is plugged into.

## What it explicitly does not gate

The **stage** and **QR** screens read public data and are open. A projector does
not type a passcode, and a stranger loading `/app/stage` sees what is already
projected on the wall behind them.

Related: [milestone 05](../../milestones/05-the-organiser-runs-the-night.md),
[nobody signs in](nobody-signs-in.md)
