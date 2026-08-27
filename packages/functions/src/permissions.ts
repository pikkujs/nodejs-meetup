import { pikkuPermission } from '#pikku/auth'

export const hasOrganiserPasscode = pikkuPermission<{ passcode: string }>(
  async ({ organiserGate }, data) => organiserGate.verify(data?.passcode),
)
