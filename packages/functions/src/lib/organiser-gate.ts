import type { TypedSecretService } from '../../.pikku/secrets/pikku-secrets.gen.js'

/**
 * Verifies the one shared organiser passcode —
 * knowledge/decisions/security/one-shared-passcode.md.
 *
 * WHY THIS IS A SERVICE and not three lines inside the permission: a
 * `pikkuPermission` receives `SecretlessServices`, so `secrets` is deliberately
 * out of reach inside an authorization check. That is the right constraint — a
 * gate should not be reaching into the secret store per request — so the secret
 * is read once here, at the edge of the app, and the permission asks a service a
 * yes/no question.
 *
 * The read is LAZY rather than in the constructor. `createSingletonServices` runs
 * for every unit including ones that will never see an organiser call, and a
 * missing passcode should fail the person trying to use it with a clear error,
 * not fail process startup somewhere unrelated.
 */
export class OrganiserGate {
  #secrets: TypedSecretService
  #expected: Promise<string> | null = null

  constructor(secrets: TypedSecretService) {
    this.#secrets = secrets
  }

  /**
   * Is this the passcode?
   *
   * Constant-time against the SHA-256 digests rather than the raw strings, so the
   * comparison neither leaks the passcode's length nor returns faster on a wrong
   * first character. Both operands are 32 bytes whatever was typed, which is the
   * property that makes the fixed-length XOR loop below meaningful.
   *
   * An empty or absent passcode is answered `false` here rather than thrown: a
   * caller with no passcode and a caller with the wrong one are the same caller,
   * and telling them apart is a courtesy extended only to people guessing.
   */
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
    // Memoised on the PROMISE, not the value: two organiser calls arriving in the
    // same tick would otherwise both miss the cache and both hit the secret store.
    this.#expected ??= this.#secrets
      .getSecret('ORGANISER_PASSCODE')
      .then((secret) => secret.reveal())
    return this.#expected
  }
}

/** Web Crypto, so this is identical under `pikku dev`, Node and a CF Worker. */
async function sha256(value: string): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return new Uint8Array(digest)
}
