import { pikkuScenario } from '#pikku/scenarios'

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
