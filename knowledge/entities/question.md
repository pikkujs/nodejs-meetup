---
type: entity
title: Question
description: Something someone in the room wants asked, attached to the talk that was on when they asked it.
tags: [entities, qa]
---

# Question

A **question** is one thing someone in the room wants asked out loud. It belongs
to the talk that was current when it was posted, and it never moves: a question
asked during talk one is a question about talk one, even after the room has moved
on.

It carries the asker's **name** — the one they typed once — because a question
with a name attached gets asked better than an anonymous one, and because the
speaker can look up and find the person.

It has **votes**, and one attendee may add at most one. The board is sorted by
them: see [the board is a queue, not a feed](../decisions/design/the-board-is-a-queue.md).

A question ends one of two ways:

- **Answered** — an organiser marks it, it drops off the board immediately. It is
  not deleted; it is done. This is the only edit an organiser makes to somebody
  else's words.
- **The night ends** — everything ends. There is no tomorrow in this app.

Nobody can edit or delete a question, including its author. In a 40-minute talk
the cost of a typo is lower than the cost of a moderation UI.

Related: [Talk](talk.md), [Attendee](attendee.md),
[milestone 02](../milestones/02-a-question-for-the-current-talk.md)
