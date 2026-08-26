/**
 * The people in the room tonight, and the people its scenarios run as.
 *
 * One `definePersonas` call for the whole project — codegen builds the `PersonaId`
 * union from it, materialises one scenario actor per person, and seeds a user row
 * each. Declaration order is the ranking, so the attendee comes first: this app is
 * for the forty people holding phones, not for the one holding the clicker.
 *
 * Addresses are never written down — each is derived from the persona id and
 * `scenarios.emailDomain` in pikku.config.json, so `priya` signs in as
 * priya@actors.local.
 *
 * NOTE ON SESSIONS: no attendee ever signs in to this app — see
 * knowledge/decisions/security/nobody-signs-in.md. These accounts exist ONLY so
 * pikku's scenario runner has a real session to drive a browser with; the product
 * itself never asks for one. The `organiser` role likewise documents the second
 * audience — the actual organiser gate is the shared passcode, enforced as a
 * permission (knowledge/decisions/security/one-shared-passcode.md), because the
 * person running the night is whoever is standing at the front, not an account.
 */
import { definePersonas } from '#pikku/scopes/pikku-personas.gen.js'
import { defineSystemRole } from '@pikku/core/role'

defineSystemRole({
  attendee: {
    displayName: 'Attendee',
    description: 'In the room with a phone. No account, no login — a name typed once.',
    scopes: [],
  },
  organiser: {
    displayName: 'Organiser',
    description: 'Runs the night from the front of the room, holding the shared passcode.',
    scopes: [],
  },
})

definePersonas({
  priya: {
    name: 'Priya',
    jobTitle: 'Attendee',
    personality: 'Front three rows, always has the question about backpressure',
    roles: ['attendee'],
    account: {},
  },
  marco: {
    name: 'Marco',
    jobTitle: 'Attendee',
    personality:
      'A SECOND attendee — exists so "one person, one vote" and "withdraw only your own" are testable at all',
    roles: ['attendee'],
    account: {},
  },
  sam: {
    name: 'Sam',
    jobTitle: 'Organiser',
    personality: 'Holds the clicker and the passcode, and is running eight minutes late',
    roles: ['organiser'],
    account: {},
  },
})
