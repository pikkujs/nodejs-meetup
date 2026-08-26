---
type: note
title: What happens to the board at 21:40?
description: Never asked. Assumed: nothing. There is no tomorrow in this app.
tags: [questions, lifecycle]
---

# What happens to the board at 21:40?

"One meetup, one night" was explicit, and past events were out of scope. Nobody
said what should happen when the last slot ends.

**Assumed:** the app simply stops being advanced. Doors-close becomes the current
slot, the Q&A composer is closed (it is an interlude), and the data sits in the
SQLite file until someone runs `pikku db reset`.

**What would change if answered:** if next month's meetup reuses this deployment,
the seed file is the whole story — replace tonight's running order and reset. If
the questions are wanted afterwards (they are often the best feedback an organiser
gets), that is an export, and it is on the [wishlist](../wishlist/export-the-questions.md).
