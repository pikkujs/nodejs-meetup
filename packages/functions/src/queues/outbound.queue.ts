import { wireQueueWorker } from '#pikku/queue'
import { pikkuMiddleware } from '#pikku/middleware'
import { sendTalkSummaryEmail } from '../functions/meetup/send-talk-summary-email.function.js'
import { postQuestionsAsIssues } from '../functions/meetup/post-questions-as-issues.function.js'

const withGithubToken = pikkuMiddleware(async ({ secrets }, { setCredential }, next) => {
  const token = await secrets.getSecret('GITHUB_TOKEN')
  if (token) {
    setCredential?.('github', { accessToken: token.reveal() })
  }
  await next()
})

wireQueueWorker({
  name: 'talk-summary-email',
  func: sendTalkSummaryEmail,
  config: {
    batchSize: 1,
    removeOnComplete: 20,
    removeOnFail: 20,
  },
})

wireQueueWorker({
  name: 'github-issues',
  func: postQuestionsAsIssues,
  config: {
    batchSize: 1,
    removeOnComplete: 20,
    removeOnFail: 20,
  },
  middleware: [withGithubToken],
})
