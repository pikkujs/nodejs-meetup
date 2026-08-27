import { pikkuScenario } from '#pikku/scenarios'

/**
 * The whole night, on its own clock, in about eight seconds.
 *
 * Every other scenario here drives the evening by hand: a human advances the schedule
 * and the assertion follows immediately. This is the only one where nobody touches it
 * after the first press — `startMeetupRun` starts the `runTheMeetup` workflow and the
 * room moves because the workflow woke up, slept, and moved it.
 *
 * That makes this scenario the only CI coverage of five wires at once. Pressing the
 * button reaches `startMeetupRun`, the workflow, `setCurrentSlot` seven times, and
 * `closeSlot` seven times; `closeSlot` in turn queues `talk-summary-email` and
 * `github-issues` for the two real talks, so both queue workers run — and with them
 * `sendTalkSummaryEmail`, `listAllQuestions` and the rendered email template.
 *
 * Be honest about what is ASSERTED, though: only the route. The queue work happens
 * downstream of an assertion this scenario cannot make from outside — a summary email
 * goes to a log, and `github-issues` reaches a stand-in that opens no issue and logs
 * the one it would have. What this buys is that those functions execute in CI and a
 * throw inside them shows up in the server log, which is a great deal more than the
 * nothing they had before.
 *
 * The durations are a second each, deliberately: `startMeetupRun`'s defaults are the
 * demo's (20s/10s), and a suite that used them would take three minutes.
 *
 * It runs LAST in the feature. It walks the evening to the end and leaves it on
 * slot-close, which is fine — every scenario that cares opens with `theCurrentSlotIs` —
 * but a run started here keeps moving for a second or two after the final assertion,
 * and a scenario that set its own slot in that window would watch the workflow take it
 * back. Adding a scenario after this one is the way to discover that.
 */
export const theEveningRunsItselfScenario = pikkuScenario<void, { passedThrough: string[] }>({
  title: 'The evening runs itself',
  description: 'One press starts the workflow, and the running order walks to the end unattended',
  tags: ['scenario', 'organiser', 'workflow'],
  func: async (_services, _data, { scenario, actors }) => {
    if (!actors?.sam) {
      throw new Error('This scenario needs the sam actor.')
    }

    await scenario.given('the evening has not started', 'theCurrentSlotIs', {
      slotId: 'slot-doors',
    })

    await scenario.when(
      'starts the night with second-long slots',
      'theOrganiserActs',
      { action: 'startMeetupRun', talkDuration: '1s', interludeDuration: '1s' },
      { actor: actors.sam },
    )

    // The first talk, not the first slot: reaching it proves the workflow advanced the
    // room twice on its own, which a run that merely started would not have done.
    await scenario.then(
      'sees the room reach the first talk on its own',
      'theRoomReaches',
      { slotId: 'slot-talk-1', withinMs: 30_000 },
      { actor: actors.sam },
    )

    const finished = await scenario.then(
      'sees it keep going to the end of the night',
      'theRoomReaches',
      { slotId: 'slot-close', withinMs: 30_000 },
      { actor: actors.sam },
    )

    // The route, not just the destination. Both talks have to be in it: they are the
    // slots `closeSlot` queues the summary email and the GitHub issues for, so a run
    // that reached the end without passing through them would have queued nothing.
    for (const slotId of ['slot-talk-1', 'slot-talk-2']) {
      if (!finished.passedThrough.includes(slotId)) {
        throw new Error(
          `The run reached the end without ever being on \`${slotId}\`. It went: ` +
            `${finished.passedThrough.join(' -> ')}. Nothing was queued for a talk that never ran.`,
        )
      }
    }

    return { passedThrough: finished.passedThrough }
  },
})
