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
    scopes: [],
  },
  speaker: {
    displayName: 'Speaker',
    description: 'Has a slot on the schedule. The person the questions are aimed at.',
    scopes: [],
  },
  organiser: {
    displayName: 'Organiser',
    description: 'Runs the night from the front of the room, holding the shared passcode.',
    scopes: ['meetup:*'],
  },
})
