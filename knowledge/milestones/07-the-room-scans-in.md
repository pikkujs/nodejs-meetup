---
type: milestone
title: The room scans in
description: A projected QR code so nobody has to type a URL in a dark room.
status: built
entities: [talk]
tags: [milestones, stage]
---

# 07 — The room scans in

`/app/qr` — projected during doors and the intro. A QR code pointing at the
attendee view, the URL spelled out beneath it in large type for anyone whose
camera is being difficult, and one line telling the room what it is for.

The code is generated in the browser from `window.location.origin`, so it is
correct on localhost, on the venue laptop, and on whatever host it is deployed
to, with nothing to configure at 18:55.

## What it takes

- `/app/qr` via `app_.qr.tsx` — outside the app shell, same reasoning as the stage
- A QR encoder rendered to SVG in the page. No network call, no image service —
  the venue wifi is the thing this screen exists to route around

## What proves it

```gherkin
Feature: Joining the meetup
  Scenario: The joining screen is projectable
    When the QR screen is projected
    Then the room sees the address to open and a code to scan
```

Related: [one app, three paths](../decisions/one-app-three-paths.md)
