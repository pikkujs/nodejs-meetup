import { pikkuFeature } from '#pikku/scenarios'
import { theRoomSeesWhatIsOnNowScenario } from '../scenarios/the-room-sees-what-is-on-now.scenario.js'
import { aFirstTimerNamesThemselvesAndAsksScenario } from '../scenarios/a-first-timer-names-themselves-and-asks.scenario.js'
import { thereIsNothingToAskDuringTheBreakScenario } from '../scenarios/there-is-nothing-to-ask-during-the-break.scenario.js'
import { theMostWantedQuestionRisesScenario } from '../scenarios/the-most-wanted-question-rises.scenario.js'
import { onePersonOneVoteScenario } from '../scenarios/one-person-one-vote.scenario.js'
import { anyoneCanSignUpForALightningTalkScenario } from '../scenarios/anyone-can-sign-up-for-a-lightning-talk.scenario.js'
import { theOrganiserAdvancesTheEveningScenario } from '../scenarios/the-organiser-advances-the-evening.scenario.js'
import { aQuestionComesOffTheBoardScenario } from '../scenarios/a-question-comes-off-the-board.scenario.js'
import { thePasscodeIsTheGateScenario } from '../scenarios/the-passcode-is-the-gate.scenario.js'
import { theOrganiserUnlocksAndRunsTheNightScenario } from '../scenarios/the-organiser-unlocks-and-runs-the-night.scenario.js'
import { theWallShowsWhatToAskNextScenario } from '../scenarios/the-wall-shows-what-to-ask-next.scenario.js'
import { theJoiningScreenIsProjectableScenario } from '../scenarios/the-joining-screen-is-projectable.scenario.js'

/**
 * One scenario per gherkin block in knowledge/milestones/, in milestone order.
 *
 * Deliberately NOT tagged `smoke`: every one of these mutates — it moves the current
 * slot, clears a board, signs somebody up. The smoke gate has to stay safe to run
 * against a server the room is using.
 *
 * Order is not incidental. `theOrganiserAdvancesTheEveningScenario` leaves the evening
 * on the break, and every scenario that cares opens by putting it back
 * (`theCurrentSlotIs`), so the suite is re-runnable and order-independent in practice —
 * but a scenario added here without that Given will be the one that breaks.
 */
export const meetupFeature = pikkuFeature({
  name: 'Running the meetup',
  description: "Every milestone's gherkin, as a scenario",
  tags: ['meetup'],
  scenarios: [
    theRoomSeesWhatIsOnNowScenario,
    aFirstTimerNamesThemselvesAndAsksScenario,
    thereIsNothingToAskDuringTheBreakScenario,
    theMostWantedQuestionRisesScenario,
    onePersonOneVoteScenario,
    anyoneCanSignUpForALightningTalkScenario,
    theOrganiserAdvancesTheEveningScenario,
    aQuestionComesOffTheBoardScenario,
    thePasscodeIsTheGateScenario,
    theOrganiserUnlocksAndRunsTheNightScenario,
    theWallShowsWhatToAskNextScenario,
    theJoiningScreenIsProjectableScenario,
  ],
})
