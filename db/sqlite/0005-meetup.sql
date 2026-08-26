-- Tonight's meetup. One night, one room — see knowledge/index.md.
--
-- Timestamps are TEXT ISO-8601 (UTC, millisecond precision) rather than a
-- semantic TIMESTAMP column: nothing in this app does date arithmetic, everything
-- either sorts them lexically (which ISO-8601 does correctly) or renders them, and
-- a string that survives the round trip untouched is one fewer coercion to be
-- wrong about on a night with no time to debug.

-- One slot on the running order. Doors, the intro, the break and pizza are slots
-- too — the room experiences them as "what is happening now" (entities/talk.md).
CREATE TABLE talk (
  id          TEXT    PRIMARY KEY,
  -- The running order. Advancing means moving to position + 1, nothing cleverer.
  position    INTEGER NOT NULL UNIQUE,
  -- Printed on the schedule for orientation, and read by nothing:
  -- decisions/the-schedule-advances-by-hand.md.
  time_label  TEXT    NOT NULL,
  title       TEXT    NOT NULL,
  speaker     TEXT,
  blurb       TEXT,
  -- 'talk' takes questions; 'interlude' (doors, break, pizza) does not.
  kind        TEXT    NOT NULL CHECK (kind IN ('talk', 'interlude'))
);

-- Exactly one row, forever. The whole room's sense of "where are we" is this
-- single pointer, which is why the CHECK makes a second row impossible rather
-- than merely unlikely.
CREATE TABLE event_state (
  id              INTEGER PRIMARY KEY CHECK (id = 1),
  current_talk_id TEXT    NOT NULL REFERENCES talk (id)
);

-- Something someone in the room wants asked. Bound to the talk that was current
-- when it was posted, and it never moves (entities/question.md).
CREATE TABLE question (
  id          TEXT PRIMARY KEY,
  talk_id     TEXT NOT NULL REFERENCES talk (id),
  body        TEXT NOT NULL,
  -- The name they typed once. Arbitrary user text: stored as text, rendered as
  -- text, length-capped in the function so it cannot push the projected view off
  -- the wall.
  author_name TEXT NOT NULL,
  -- A claim, not a credential — decisions/security/nobody-signs-in.md.
  attendee_id TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  -- Set once, never cleared. An answered question is done, not deleted: it drops
  -- off every board and stays in the file.
  answered_at TEXT
);

-- The board reads exactly one shape: unanswered questions for the current talk.
CREATE INDEX question_board_idx ON question (talk_id, answered_at);

-- One vote per device per question, enforced by the primary key rather than by a
-- read-then-write that two phones can interleave.
CREATE TABLE question_vote (
  question_id TEXT NOT NULL REFERENCES question (id),
  attendee_id TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  PRIMARY KEY (question_id, attendee_id)
);

-- A name on the 20:20 list. Sign-up order IS the running order
-- (entities/lightning-slot.md), which is why there is no position column.
CREATE TABLE lightning_slot (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  topic       TEXT NOT NULL,
  -- One slot per device, and the only person who may withdraw it.
  attendee_id TEXT NOT NULL UNIQUE,
  created_at  TEXT NOT NULL
);
