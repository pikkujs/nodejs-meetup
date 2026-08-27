export const classifications = {
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
    body: { security: 'public' },
    author_name: {
      security: 'public',
      classification: 'fake:name',
      description: 'Display name the asker typed. Shown on the board and the projector.',
    },
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
    attendee_id: {
      security: 'private',
      classification: 'hash',
      description: 'Who cast this vote. Counts are public, the ballot is not.',
    },
    created_at: { security: 'private' },
  },

  lightning_slot: {
    id: { security: 'public' },
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

  user: {
    name: { security: 'pii', classification: 'fake:name' },
    email: { security: 'pii', classification: 'fake:email', format: 'email' },
    image: { security: 'pii' },
    ban_reason: { security: 'private' },
  },

  session: {
    token: {
      security: 'secret',
      form: 'plain',
      description: 'Bearer session token, stored as issued. Compared, never displayed.',
    },
    ip_address: { security: 'pii', classification: 'hash' },
    user_agent: { security: 'private' },
  },
}
