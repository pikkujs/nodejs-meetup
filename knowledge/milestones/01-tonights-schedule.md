---
type: milestone
title: Tonight's schedule, with what is on now at the top
description: The spine — the running order exists, one slot is current, and the room can see which.
status: built
entities: [talk]
tags: [milestones, schedule]
---

# 01 — Tonight's schedule

The one object everything else hangs off. Tonight's running order is in the
database, exactly one slot is current, and an attendee opening the app on their
phone sees what is on **now**, pinned above everything else, then the rest of the
evening below it.

No login, no name yet, nothing to press. Open the URL, know where you are.

## What it takes

- `talk` table — position, time label, title, speaker, kind (`talk` / `interlude`)
- `event_state` — a single row holding the current talk. One pointer, one truth
- Seeded with tonight's real running order, doors to doors
- `listSchedule` — public, readonly, returns the slots and which is current
- `/app` — the current slot as a card with a green rail and the word **Now**, the
  rest as a timeline beneath it

## What proves it

```gherkin
Feature: Tonight's schedule
  Scenario: The room sees what is on now
    Given tonight's running order is seeded from doors to doors
    When 'priya' opens the meetup app
    Then she sees the current slot marked Now above the rest of the evening
    And she sees every later slot with its time
```

Related: [Talk](../entities/talk.md),
[the schedule advances by hand](../decisions/the-schedule-advances-by-hand.md)
