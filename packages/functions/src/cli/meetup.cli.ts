import type { z } from 'zod'
import { pikkuCLICommand, pikkuCLIRender, wireCLI } from '#pikku/cli'
import { advanceSchedule } from '../functions/meetup/advance-schedule.function.js'
import {
  ListAllQuestionsOutput,
  listAllQuestions,
} from '../functions/meetup/list-all-questions.function.js'
import { ListScheduleOutput, listSchedule } from '../functions/meetup/list-schedule.function.js'
import { startMeetupRun } from '../functions/meetup/start-meetup-run.function.js'

const renderSchedule = pikkuCLIRender<z.infer<typeof ListScheduleOutput>>(
  (_services, { slots }) => {
    for (const slot of slots) {
      const speaker = slot.speaker ? ` — ${slot.speaker}` : ''
      console.log(`${slot.isCurrent ? '>' : ' '} ${slot.timeLabel}  ${slot.title}${speaker}`)
    }
  },
)

const renderQuestions = pikkuCLIRender<z.infer<typeof ListAllQuestionsOutput>>(
  (_services, { talks, total }) => {
    for (const talk of talks) {
      if (talk.questions.length === 0) continue
      console.log(`\n${talk.title}`)
      for (const question of talk.questions) {
        console.log(`  ${question.answered ? '✓' : ' '} (${question.votes}) ${question.body}`)
      }
    }
    console.log(`\n${total} question(s) tonight.`)
  },
)

wireCLI({
  program: 'meetup',
  description: 'Run tonight from a terminal.',
  commands: {
    schedule: pikkuCLICommand({
      func: listSchedule,
      render: renderSchedule,
      description: "Print tonight's running order, with the current slot marked",
    }),
    questions: pikkuCLICommand({
      func: listAllQuestions,
      render: renderQuestions,
      description: 'Print every question the room has asked, grouped by talk',
      options: {
        talkId: { description: 'Restrict to one slot' },
        includeAnswered: {
          description: 'Include questions the host already got through',
          default: false,
        },
      },
    }),
    advance: pikkuCLICommand({
      func: advanceSchedule,
      description: 'Move the evening on by one slot',
      options: {
        passcode: { description: 'The shared organiser passcode' },
      },
    }),
    start: pikkuCLICommand({
      func: startMeetupRun,
      description: 'Start the workflow that walks the running order unattended',
      options: {
        passcode: { description: 'The shared organiser passcode' },
        talkDuration: { description: 'How long a talk gets, e.g. 20m', default: '20s' },
        interludeDuration: { description: 'How long a break gets, e.g. 5m', default: '10s' },
      },
    }),
  },
})
