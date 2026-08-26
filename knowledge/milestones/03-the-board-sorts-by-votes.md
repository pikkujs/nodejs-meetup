---
type: milestone
title: The board sorts by votes
description: Upvoting, once per person, and the queue that comes out of it.
status: built
entities: [question]
tags: [milestones, qa]
---

# 03 — The board sorts by votes

The board becomes useful: an attendee upvotes someone else's question, the board
reorders, and the top row is what the host should ask next. One vote per person
per question — the second attempt is refused, not silently ignored.

## What it takes

- `question_vote` table — (question_id, attendee_id) unique
- `upvoteQuestion` — public. Idempotent-by-refusal: a second vote from the same
  device is a conflict, and the client shows the control as already cast
- `listQuestions` returns `votes` and `youVoted`, ordered votes desc, created asc
- Board rows show a vote control that is filled green once you have used it

## What proves it

```gherkin
Feature: The board is a queue
  Scenario: The most wanted question rises
    Given 'priya' has asked about backpressure
    And 'marco' has asked about worker threads
    When 'marco' upvotes the backpressure question
    Then the backpressure question is at the top of the board

  Scenario: One person, one vote
    Given 'marco' has upvoted the backpressure question
    When he tries to upvote it a second time
    Then he is refused
    And the question still has one vote
```

Related: [the board is a queue](../decisions/design/the-board-is-a-queue.md),
[live means polling](../decisions/live-means-polling.md)
