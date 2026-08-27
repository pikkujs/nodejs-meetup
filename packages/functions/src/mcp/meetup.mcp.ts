import { wireMCPPrompt, wireMCPResource } from '#pikku/mcp'
import { briefTheHostPrompt } from './brief-the-host.function.js'
import { scheduleResource } from './schedule-resource.function.js'

wireMCPResource({
  uri: 'meetup://schedule',
  title: "Tonight's running order",
  description: 'Every slot in order, with the current one marked.',
  func: scheduleResource,
  tags: ['meetup'],
})

wireMCPPrompt({
  name: 'briefTheHost',
  description: 'Summarise the questions asked tonight and pick the two worth asking on stage.',
  func: briefTheHostPrompt,
  tags: ['meetup'],
})
