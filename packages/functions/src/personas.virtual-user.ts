import { definePersonas } from '#pikku/scopes/pikku-personas.gen.js'

definePersonas({
  priya: {
    name: 'Priya',
    jobTitle: 'attendee',
    personality: 'Front three rows, always has the question about backpressure',
    roles: ['attendee'],
    account: {},
  },
  marco: {
    name: 'Marco',
    jobTitle: 'attendee',
    personality:
      'A SECOND attendee — exists so "one person, one vote" and "withdraw only your own" are testable at all',
    roles: ['attendee'],
    account: {},
  },
  jonas: {
    name: 'Jonas',
    jobTitle: 'speaker',
    personality:
      'Has the 20:00 slot. Reads the board between slides to see what is coming, and never posts to it — the questions are about him',
    roles: ['speaker'],
    account: {},
  },
  sam: {
    name: 'Sam',
    jobTitle: 'organiser',
    personality: 'Holds the clicker and the passcode, and is running eight minutes late',
    roles: ['organiser'],
    account: {},
  },
})
