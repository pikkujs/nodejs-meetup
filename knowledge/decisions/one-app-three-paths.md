---
type: decision
title: One app, three audiences, three paths
description: Attendee, organiser and projector share one frontend and one API. The split is by path, not by host.
tags: [decisions, architecture]
---

# One app, three paths

There is one frontend. Three audiences use it, separated by path:

- **`/app`, `/app/questions`, `/app/lightning`** — the room, on phones. No login.
- **`/app/organiser`** — one person, behind the shared passcode.
- **`/app/stage`, `/app/qr`** — the projector. Full-bleed, no app shell, no
  navigation, nothing to click.

## Why not separate apps

The usual reason to split hosts is that the audiences share no screens and should
not see each other's brand register. Here they share a room, a night, and one
piece of data. The organiser's phone is also an attendee's phone. Splitting hosts
would mean two deploys and two URLs to read out loud to a room of forty people,
to save nothing.

## Why the projector screens sit outside the app shell

`/app/stage` and `/app/qr` are rendered on a wall, five metres away, by a laptop
nobody is touching. A sidebar, a tab bar and an account menu are all noise on a
wall — and worse, the phone tab bar would eat the bottom of a 1080p projection.
They use TanStack's non-nested segment (`app_.stage.tsx`) so they keep the `/app`
URL prefix and skip the layout.

## What this rules out

- The path split is **presentation, not security**. `/app/organiser` not appearing
  in the nav is not access control; the passcode check on the function is — see
  [one shared passcode](security/one-shared-passcode.md).
- No per-audience theming. One theme, three densities.

Related: [milestone 06](../milestones/06-the-big-screen.md)
