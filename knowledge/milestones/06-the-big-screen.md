---
type: milestone
title: The big screen
description: The projected view — the top three questions for the current talk, in huge type.
status: built
entities: [question, talk]
tags: [milestones, stage, design]
---

# 06 — The big screen

The one we project. `/app/stage`, opened on the laptop plugged into the projector
and then left alone for two hours.

Full-bleed: no sidebar, no tab bar, no account menu, no scrollbar. The current
talk's title across the top, the **top three** unanswered questions beneath it at
a size readable from the back row, each with its vote count and the asker's name.
It refreshes itself every three seconds.

Depends on 05: the current talk has to be movable before "the top three for the
current talk" means anything.

## What it takes

- `getStageView` — public, readonly. Current talk plus its top three questions.
  One call, because the projector should make one request, not three
- `/app/stage` via `app_.stage.tsx` — outside the app shell (see
  [one app, three paths](../decisions/one-app-three-paths.md))
- Type scaled with `clamp()` against the viewport, not fixed points — the wall is
  1080p or 720p and nobody knows which until the cable is in
- An honest empty state: during an interlude it says what is happening; with no
  questions it says the board is open and shows the URL

## What proves it

```gherkin
Feature: The projected board
  Scenario: The wall shows what to ask next
    Given talk one is the current slot
    And 'priya' has asked about backpressure
    And 'marco' has asked about worker threads and upvoted the backpressure one
    When the stage view is projected
    Then the backpressure question is first on the wall
    And the current talk's title is on the wall
```

Related: [two viewing distances](../decisions/design/two-viewing-distances.md)
