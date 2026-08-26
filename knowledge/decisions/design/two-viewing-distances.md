---
type: decision
title: Two viewing distances, one theme
description: The direction — a dark, high-contrast terminal register that works at arm's length and at five metres.
tags: [decisions, design, theme]
---

# Two viewing distances

Nobody chose a brand for this, so the constraint chose it: **this app is read at
two distances and in one lighting condition.**

- **Arm's length**, on a phone, in a room with the lights down for a projector.
- **Five metres**, on a wall, by forty people at once.

That is the whole direction. Everything below follows from it.

## The theme: `meetup`

- **Dark by default, and dark is not a preference here — it is the room.** A white
  phone screen in a darkened room is a torch pointed at the person next to you.
  The light scheme still exists and still passes contrast, for the organiser
  setting up at 18:30 with the lights on.
- **One accent: Node green (`#5fa04e`).** It is the only saturated colour in the
  app, so it means exactly one thing — *this is the thing that is live right now*.
  The current talk, the vote you have cast, the passcode-unlocked state. Nothing
  decorative is green.
- **Type: JetBrains Mono for headings and numerals, Inter for body.** A room full
  of Node developers reads a monospace heading as native rather than as a
  gimmick, and — the real reason — monospace numerals mean a vote count ticking
  from 9 to 10 does not shift the layout of a projected board.
- **Flat surfaces, hairline borders, no shadows.** Shadows are invisible on a
  projector and cost contrast on an OLED phone. Structure comes from borders and
  spacing.
- **Generous radius (`lg`), roomy tap targets.** Every attendee control is
  operated one-handed, standing up, possibly holding a slice of pizza.

## What this rules out

- **No per-audience palette.** The stage view is the same theme at three times the
  type scale, not a second design. See
  [one app, three paths](../one-app-three-paths.md).
- **No imagery, no illustration, no empty-state art.** Every screen is text and
  the room's own words. There is nothing to illustrate and no time to load it on
  venue wifi.
- **No colour-only status.** The current talk carries a green rail *and* the word
  "Now"; an answered question is removed, not greyed out. Assume a projector with
  bad colour and someone at the back who is colourblind.
