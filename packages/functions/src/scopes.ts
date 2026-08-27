/**
 * The app's own authorization vocabulary: what running the night consists of,
 * and which role holds it.
 *
 * This lives beside `permissions.ts` rather than in `personas.virtual-user.ts`,
 * where it started. Personas have to live in a `*.virtual-user.ts` file — the
 * pikku CLI finds them by glob — and the roles were only in there because they
 * were written next to the personas that name them. A role is not a virtual
 * user: the console grants it to real people, and a file named for the test
 * harness is the wrong place to look for the answer to "who may advance the
 * schedule".
 *
 * NOTHING REQUIRES THESE SCOPES YET, and that is a property of the app rather
 * than an omission. Every organiser function is a `pikkuSessionlessFunc`, whose
 * config type omits `scopes` outright: scopes are AND-ed and `verifyScopes`
 * fails closed, so an anonymous caller holds none and a sessionless function
 * requiring one would reject every caller it exists to serve. The organiser
 * gate is therefore the shared passcode, enforced as a permission
 * (knowledge/decisions/security/one-shared-passcode.md).
 *
 * The vocabulary is still worth declaring: it is what the console renders when
 * granting, it is what `organiser` grants instead of the empty array it granted
 * before, and it is the set a signed-in organiser would hold the day this app
 * grows one.
 */
import { defineScope, defineSystemRole } from '#pikku/scopes'

defineScope({
  meetup: {
    displayName: 'The meetup',
    description: 'Running the night from the front of the room',
    scopes: {
      schedule: {
        description: 'Put a slot on stage and move the night along',
      },
      questions: {
        description: 'Moderate the board — mark a question as answered',
      },
      run: {
        description: 'Start the run that drives the schedule for the evening',
      },
    },
  },
})

defineSystemRole({
  attendee: {
    displayName: 'Attendee',
    description: 'In the room with a phone. No account, no login — a name typed once.',
    // Deliberately empty, and it has to be: an attendee never signs in
    // (knowledge/decisions/security/nobody-signs-in.md), so there is no session
    // to hold a grant. The attendee surface is public by construction, not by
    // a scope nobody was given.
    scopes: [],
  },
  speaker: {
    displayName: 'Speaker',
    description: 'Has a slot on the schedule. The person the questions are aimed at.',
    // Also empty, for a different reason than the attendee: a speaker is not
    // short of permission, they are short of anything private to read. The
    // board for their talk is the same board the room sees, and the one thing
    // written back — marking a question answered — is the organiser's.
    scopes: [],
  },
  organiser: {
    displayName: 'Organiser',
    description: 'Runs the night from the front of the room, holding the shared passcode.',
    // `meetup:*` — the whole tree, because there is no organiser who may
    // advance the schedule but not clear a question. Splitting it would invent
    // a distinction the room does not have.
    scopes: ['meetup:*'],
  },
})
