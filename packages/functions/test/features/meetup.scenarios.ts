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
import { theEveningRunsItselfScenario } from '../scenarios/the-evening-runs-itself.scenario.js'
import { theAssistantAnswersFromTheRoomScenario } from '../scenarios/the-assistant-answers-from-the-room.scenario.js'

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
    theAssistantAnswersFromTheRoomScenario,
    theEveningRunsItselfScenario,
  ],
})
