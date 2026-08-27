// Column annotations. `fabric db` is a coworker, not a codegen: it fills in the derived
// `kind` for your typed columns here — but this file is yours to edit too.
//
// Give a column a SEMANTIC type in your migration and it is typed + coerced
// end-to-end. On SQLite only the first of these is derived for you; the other two
// you add by hand, once:
//   - BOOLEAN column   -> kind 'bool'                    -> `boolean` (derived; write true/false)
//   - TIMESTAMP/DATE   -> kind 'date'                    -> `Date`   (ADD BY HAND, else `string`)
//   - JSON column      -> kind 'json' + a `tsType`       -> parsed    (ADD BY HAND, else `unknown`)
// e.g.  ascent: { climbed_at: { kind: 'date' }, meta: { kind: 'json', tsType: 'Meta' } }
// A plain INTEGER flag or TEXT date is fine too — it just types as number/string; use
// a semantic type when you want a real boolean/Date/object. Never write 0/1 or ISO
// strings for a typed column, and never fight the generated type with casts.
//
// Add your own security/classification annotations by hand (the data-classification
// flow) and `fabric db` steps aside — once this file carries manual fields it won't
// overwrite them.
export const classifications = {
  // The schedule is a poster. It is read off a wall by people who have not
  // opened the app, it is the one thing here with no author, and marking it
  // public is what says the rest of this file is not paranoia — `private` is the
  // DEFAULT for an unlisted column, so the entries that matter are the ones that
  // depart from it.
  talk: {
    id: { security: 'public' },
    position: { security: 'public' },
    time_label: { security: 'public' },
    title: { security: 'public' },
    speaker: { security: 'public' },
    blurb: { security: 'public' },
    kind: { security: 'public' },
  },

  event_state: {
    id: { security: 'public' },
    current_talk_id: { security: 'public' },
  },

  question: {
    id: { security: 'public' },
    talk_id: { security: 'public' },
    // Projected on a wall the moment it is asked — public is the whole point of
    // it, not an oversight.
    body: { security: 'public' },
    // Public, and that is a DECISION rather than a default. A name a person
    // typed about themselves is personal data, and PKU910 is right that a
    // sessionless function returning it deserves a question — the answer here is
    // that being on the projector beside the question is the entire point of
    // typing it. `fake:name` stays, so a shared dump still anonymizes.
    author_name: {
      security: 'public',
      classification: 'fake:name',
      description: 'Display name the asker typed. Shown on the board and the projector.',
    },
    // The device claim behind the question — decisions/security/nobody-signs-in.md.
    // Never leaves the process: it is compared server-side to compute `youVoted`,
    // and returning it would let any phone impersonate any other.
    attendee_id: {
      security: 'private',
      classification: 'hash',
      description: 'Opaque per-device id. A claim, not a credential — never returned.',
    },
    created_at: { security: 'public' },
    answered_at: { security: 'public' },
  },

  question_vote: {
    question_id: { security: 'public' },
    // WHO voted for what is the one thing on this board nobody agreed to share.
    // The counts are public; the ballot is not.
    attendee_id: {
      security: 'private',
      classification: 'hash',
      description: 'Who cast this vote. Counts are public, the ballot is not.',
    },
    created_at: { security: 'private' },
  },

  lightning_slot: {
    id: { security: 'public' },
    // Public for the same reason as question.author_name: the list is read out
    // from the stage, which is what signing up asks for.
    name: {
      security: 'public',
      classification: 'fake:name',
      description: 'Speaker name on the lightning list. Read out loud from the stage.',
    },
    topic: { security: 'public' },
    attendee_id: {
      security: 'private',
      classification: 'hash',
      description: 'Who signed up, so they can withdraw their own slot.',
    },
    created_at: { security: 'public' },
  },

  // Better Auth's tables. Nobody in the room signs in
  // (decisions/security/nobody-signs-in.md) — these hold the organiser and the
  // synthetic scenario/fabric actors — but the columns are what they are, and an
  // anonymize run should not hand a dump somebody's real address.
  user: {
    name: { security: 'pii', classification: 'fake:name' },
    email: { security: 'pii', classification: 'fake:email', format: 'email' },
    image: { security: 'pii' },
    ban_reason: { security: 'private' },
  },

  session: {
    // `plain` is the true answer, not a shrug: Better Auth stores the session
    // token as issued, and reading the row IS meant to yield a usable
    // credential — that is what a session token is for. Stating it is what
    // PKU483 asks for, and it is why `secret` here does not imply ciphertext.
    token: {
      security: 'secret',
      form: 'plain',
      description: 'Bearer session token, stored as issued. Compared, never displayed.',
    },
    ip_address: { security: 'pii', classification: 'hash' },
    user_agent: { security: 'private' },
  },
}
