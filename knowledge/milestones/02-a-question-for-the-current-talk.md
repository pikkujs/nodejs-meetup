---
type: milestone
title: A question for the current talk
description: The main thing someone does on their first visit — type your name once, ask the speaker something.
status: built
entities: [question, attendee]
tags: [milestones, qa]
---

# 02 — A question for the current talk

**This is what someone does on their first visit**, and the reason the URL gets
read out at the front of the room.

An attendee opens the Q&A board, is asked for their name once, types it, and it
is never asked for again on that device. They post a question; it appears on the
board under their name, attached to whatever talk is current.

## What it takes

- `question` table — talk_id, body, author name, attendee id, created_at,
  answered_at (null)
- Attendee identity in the browser: a generated device id and a name, in
  `localStorage`, established by a first-run prompt
- `askQuestion` — public. Rejects an empty body, caps the length, refuses to
  attach a question to an `interlude`
- `listQuestions` — public, readonly, current talk only, unanswered only
- `/app/questions` — the name gate, the composer, the board

## What proves it

```gherkin
Feature: Asking the current speaker something
  Scenario: A first-time attendee names themselves and asks
    Given talk one is the current slot
    And 'priya' has never opened the app on this device
    When she gives her name once
    And she asks how streams handle backpressure
    Then her question appears on the board for talk one under her name
    And she is not asked for her name again

  Scenario: There is nothing to ask during the break
    Given the break is the current slot
    When 'marco' opens the Q&A board
    Then he is told what is happening instead of being offered a composer
```

Related: [Question](../entities/question.md),
[the Q&A follows the current talk](../decisions/qa-follows-the-current-talk.md),
[nobody signs in](../decisions/security/nobody-signs-in.md)
