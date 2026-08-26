---
type: milestone
title: The organiser runs the night
description: The passcode, advancing the schedule, and marking a question answered — plus the refusal that proves the gate.
status: built
entities: [talk, question]
tags: [milestones, organiser, security]
---

# 05 — The organiser runs the night

Behind one shared passcode: move the evening forward, and take a question off the
board once it has been asked out loud.

This milestone carries its own refusal. A gate that is only ever tested by
someone who has the key is not tested.

## What it takes

- `ORGANISER_PASSCODE` secret, declared with `defineSecret`
- `hasOrganiserPasscode` — a `pikkuPermission`, constant-time comparison
- `advanceSchedule` — moves `event_state` to the next slot. Refuses past the end
- `markQuestionAnswered` — stamps `answered_at`, which drops it off every board
- `checkOrganiserPasscode` — so the passcode screen can say "wrong passcode"
  before the organiser presses Next in front of a room
- `/app/organiser` — passcode entry, the current slot with what's next, and the
  live board with an **Answered** control per row

## What proves it

```gherkin
Feature: Running the night
  Scenario: The organiser advances the evening
    Given talk one is the current slot
    When 'sam' advances the schedule with the passcode
    Then the short break is the current slot
    And the room's schedule shows the break as Now

  Scenario: A question comes off the board once it is asked
    Given 'priya' has asked about backpressure
    When 'sam' marks it answered
    Then it is gone from the board

  Scenario: The passcode is the gate, not the screen
    When 'priya' tries to advance the schedule without the passcode
    Then she is refused
    And talk one is still the current slot
```

Related: [one shared passcode](../decisions/security/one-shared-passcode.md),
[the schedule advances by hand](../decisions/the-schedule-advances-by-hand.md)
