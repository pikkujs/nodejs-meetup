---
type: Overview
title: Security decisions
description: Who may reach what, for one night in one room.
tags: [decisions, security]
---

# Security decisions

- [Nobody signs in](nobody-signs-in.md)
- [One shared passcode](one-shared-passcode.md)

<!-- pikku:knowledge-index -->
- [Nobody signs in](nobody-signs-in.md) — The attendee surface is fully public. Identity is a name in localStorage and nothing more.
- [One shared passcode gates every organiser action](one-shared-passcode.md) — A capability check in the permissions field, not a login. The passcode is the credential.
- [The attendee API is public, deliberately](the-attendee-api-is-public.md) — Eight functions are exposed with no permission and no session. Why that is the design, and what it costs.
<!-- /pikku:knowledge-index -->
