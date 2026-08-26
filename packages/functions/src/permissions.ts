import { pikkuPermission } from '#pikku/auth'

/**
 * The organiser gate — knowledge/decisions/security/one-shared-passcode.md.
 *
 * It lives in the `permissions` field of every organiser function and nowhere
 * else. That is what makes it apply identically to the organiser screen, to
 * `curl`, and to `POST /rpc/:rpcName`, and what lets `pikku info permissions`
 * report the gate without reading any function body. A check inside the body
 * would gate exactly one of those three and be invisible to the other two.
 *
 * The passcode travels in the request payload because there is no session to
 * carry it — this is a capability, not an identity. `nobody signs in` is the
 * whole shape of this app.
 */
export const hasOrganiserPasscode = pikkuPermission<{ passcode: string }>(
  async ({ organiserGate }, data) => organiserGate.verify(data?.passcode),
)
