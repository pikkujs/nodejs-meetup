import type { TypedSecretService } from '../../.pikku/secrets/pikku-secrets.gen.js'

export class OrganiserGate {
  #secrets: TypedSecretService
  #expected: Promise<string> | null = null

  constructor(secrets: TypedSecretService) {
    this.#secrets = secrets
  }

  async verify(candidate: string | undefined | null): Promise<boolean> {
    if (!candidate) {
      return false
    }
    const expected = await this.#expectedPasscode()
    const [a, b] = await Promise.all([sha256(candidate), sha256(expected)])
    let diff = 0
    for (let i = 0; i < a.length; i++) {
      diff |= a[i]! ^ b[i]!
    }
    return diff === 0
  }

  #expectedPasscode(): Promise<string> {
    this.#expected ??= this.#secrets
      .getSecret('ORGANISER_PASSCODE')
      .then((secret) => secret.reveal())
    return this.#expected
  }
}

async function sha256(value: string): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return new Uint8Array(digest)
}
