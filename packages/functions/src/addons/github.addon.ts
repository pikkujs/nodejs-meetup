import { wireAddon } from '#pikku/addon'

/**
 * GitHub, so a question the room cared about outlives the room.
 *
 * The addon covers the whole GitHub API; this app calls exactly one function of
 * it — `github:issuesCreate`, from the `github-issues` queue worker. There is no
 * narrowing knob for that: wiring an addon wires the package. What IS narrowed
 * is the credential, which the addon reads as `github` and which this project
 * only ever populates with a token scoped to opening issues on one repository
 * (see lib/github-credentials.ts).
 *
 * No `auth: true`. Nobody signs in to this app
 * (knowledge/decisions/security/nobody-signs-in.md), so a session gate here
 * would gate nothing and break the queue worker, which has no session either.
 * The reason no attendee can reach GitHub is that the only function that calls
 * it is a queue worker, and queue workers are not exposed over `/rpc/:rpcName`.
 */
wireAddon({
  name: 'github',
  package: '@pikku/addon-github',
})
