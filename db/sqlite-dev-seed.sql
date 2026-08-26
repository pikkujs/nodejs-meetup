-- Dev seed. `pikku db reset` wipes, migrates and applies this in one go — it is the
-- ONLY seed file the CLI reads, and it always arrives at a database it just wiped,
-- so these are plain INSERTs with nothing to defend themselves against.
--
-- This is TONIGHT'S RUNNING ORDER, exactly as the organiser gave it. Changing the
-- meetup means editing this file and running `pikku db reset` — there is no admin
-- screen for the schedule, because the schedule is decided weeks before doors.

INSERT INTO talk (id, position, time_label, title, speaker, blurb, kind) VALUES
  ('slot-doors',   1, '19:00', 'Doors open', NULL,
   'Come in, grab a drink, scan the code on the screen.', 'interlude'),

  ('slot-intro',   2, '19:15', 'Intro by our hosts at Contentful', NULL,
   'Housekeeping, fire exits, and thank-yous.', 'interlude'),

  ('slot-talk-1',  3, '19:20', 'Vibe coding is the easy part', 'Yasser Fadl',
   'Anyone can generate an app — that''s the commodity. The boring 80% underneath isn''t, and AI can''t pick it for you: too many defensible answers, a different architecture every time you ask. Pikku is plain, fully-typed TypeScript that wires one function to HTTP, CLI, queues or agents, and plugs into whatever stack you already have. Live build from one prompt at the end.',
   'talk'),

  ('slot-break',   4, '19:50', 'Short break', NULL,
   'Stretch. The board stays open — questions for the next talk start when it does.', 'interlude'),

  ('slot-talk-2',  5, '20:00', 'Building desktop apps in JavaScript with Electron', 'Niklas Wenzel',
   'We''ll have an Electron maintainer show us how to build desktop apps using web technologies. We''ll code a simple app from scratch, and we''ll discuss how it all works under the hood.',
   'talk'),

  ('slot-pizza',   6, '20:30', 'Pizza and networking', NULL,
   'Lightning talks happen here — put your name on the list.', 'interlude'),

  ('slot-close',   7, '21:40', 'Doors close', NULL,
   'Thanks for coming. Same time next month.', 'interlude');

-- Seeded MID-EVENT, on talk one, deliberately. A meetup app seeded at "doors open"
-- is an app whose every interesting screen is empty: no board, no votes, no queue,
-- nothing to judge a layout against. Advance backwards for a true cold open by
-- resetting and pointing this at 'slot-doors'.
INSERT INTO event_state (id, current_talk_id) VALUES (1, 'slot-talk-1');

-- A board mid-talk. Vote counts differ so the ORDER is visible at a glance, the
-- longest question is long on purpose (it is what wraps on a phone and what
-- overflows on a projector), and one is already answered so the "drops off the
-- board" rule has something to be true about.
INSERT INTO question (id, talk_id, body, author_name, attendee_id, created_at, answered_at) VALUES
  ('q-seed-1', 'slot-talk-1',
   'How does the typed RPC layer hold up once two teams are editing the same function signatures in different branches?',
   'Lena', 'seed-lena', '2026-08-26T17:24:03.100Z', NULL),
  ('q-seed-2', 'slot-talk-1',
   'What is actually in the boring 80%? Give us the list.',
   'Tomás', 'seed-tomas', '2026-08-26T17:25:41.220Z', NULL),
  ('q-seed-3', 'slot-talk-1',
   'Does this work if half our stack is already Nest?',
   'Ade', 'seed-ade', '2026-08-26T17:26:12.870Z', NULL),
  ('q-seed-4', 'slot-talk-1',
   'Can you show the live build now instead of at the end?',
   'Bea', 'seed-bea', '2026-08-26T17:27:55.010Z', NULL),
  ('q-seed-5', 'slot-talk-1',
   'What happens to the generated client when a function is deleted?',
   'Ravi', 'seed-ravi', '2026-08-26T17:21:09.500Z', '2026-08-26T17:28:40.000Z');

INSERT INTO question_vote (question_id, attendee_id, created_at) VALUES
  ('q-seed-1', 'seed-tomas', '2026-08-26T17:26:00.000Z'),
  ('q-seed-1', 'seed-ade',   '2026-08-26T17:26:30.000Z'),
  ('q-seed-1', 'seed-bea',   '2026-08-26T17:27:00.000Z'),
  ('q-seed-1', 'seed-ravi',  '2026-08-26T17:27:20.000Z'),
  ('q-seed-2', 'seed-lena',  '2026-08-26T17:26:10.000Z'),
  ('q-seed-2', 'seed-ade',   '2026-08-26T17:26:40.000Z'),
  ('q-seed-3', 'seed-bea',   '2026-08-26T17:27:10.000Z');

-- Three on the lightning list, in sign-up order, because that IS the running order.
INSERT INTO lightning_slot (id, name, topic, attendee_id, created_at) VALUES
  ('ls-seed-1', 'Ade',   'Killing a 400ms cold start with one import', 'seed-ade',   '2026-08-26T17:10:02.000Z'),
  ('ls-seed-2', 'Lena',  'node:test is fine, actually',                'seed-lena',  '2026-08-26T17:14:48.000Z'),
  ('ls-seed-3', 'Tomás', 'Three things AsyncLocalStorage is bad at',   'seed-tomas', '2026-08-26T17:19:31.000Z');
