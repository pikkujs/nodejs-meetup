---
type: decision
title: The board is a queue, not a feed
description: Sorted by votes, newest last, answered questions gone. The top of the board is what to ask next.
tags: [decisions, design, qa]
---

# The board is a queue, not a feed

The Q&A board is sorted by vote count, descending, with the oldest question
winning a tie. It is not chronological and it never will be.

The board answers exactly one question: **what should be asked next?** The row at
the top is the answer. That is the only reason the board is on the wall.

## Consequences taken deliberately

- **An answered question disappears immediately.** Not struck through, not moved
  to a "done" section, not greyed. It has been asked; leaving it on screen costs
  a row on a projector and a second of confusion for whoever reads the board next.
  It is still in the database — this is the app forgetting, not deleting.
- **Oldest wins a tie**, so a question that has been waiting patiently at two
  votes outranks one that just arrived at two. Without this, ties reshuffle on
  every poll and the projected board flickers.
- **You may not un-vote.** A vote is a hand going up, and hands do not come down.
  It also removes an entire class of "the count went down, is it broken?" from a
  screen nobody can ask questions about.
- **Your own vote is shown as a filled green control, not a disabled grey one.**
  Having voted is a state worth seeing from across the room, not an absence.

Related: [Question](../../entities/question.md),
[milestone 03](../../milestones/03-the-board-sorts-by-votes.md)
