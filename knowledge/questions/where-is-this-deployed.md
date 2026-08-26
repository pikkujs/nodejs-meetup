---
type: note
title: Where is this running tonight?
description: Never asked. Built to run anywhere, assuming a laptop on the venue wifi.
tags: [questions, deploy]
---

# Where is this running tonight?

Unknown. Nobody said whether this is `bun run dev` on a laptop plugged into the
projector and shared over the venue wifi, or deployed somewhere with a real
hostname that can be read out to the room.

**Assumed:** origin-relative everywhere. Nothing hardcodes a host or a port; the
QR screen derives the join URL from `window.location.origin` at render time, and
the API URL comes from the environment. Both shapes work with no code change.

**What would change if answered:** if it is a laptop, the QR code is the only
practical way in and the projector should sit on `/app/qr` during doors. If it is
a real hostname, a short URL read out loud is faster than forty cameras.
