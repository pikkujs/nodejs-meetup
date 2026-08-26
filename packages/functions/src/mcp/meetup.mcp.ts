import { wireMCPPrompt, wireMCPResource } from '#pikku/mcp'
import { briefTheHostPrompt } from './brief-the-host.function.js'
import { scheduleResource } from './schedule-resource.function.js'

/**
 * The night, as something an assistant can read.
 *
 * The room already reads all of this over HTTP without signing in
 * (knowledge/decisions/security/nobody-signs-in.md), so exposing it to MCP hands
 * out nothing that a phone in the room could not already fetch. That is the whole
 * reason only the READ functions carry `mcp: true` and nothing here writes:
 * `askQuestion` posts under a name, and a tool that posts under a name nobody in
 * the room chose is a different trust question from a tool that lists what was
 * already said out loud.
 *
 * Everything is a thin layer over `rpc.invoke`, so the logic under it is the same
 * logic the scenarios already run.
 */
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
