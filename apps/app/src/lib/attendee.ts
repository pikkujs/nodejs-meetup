import { useCallback, useSyncExternalStore } from 'react'

/**
 * Who you are tonight — knowledge/entities/attendee.md.
 *
 * Two strings in `localStorage` and nothing else. No account, no session, no
 * cookie, no server-side record until you post something. See
 * knowledge/decisions/security/nobody-signs-in.md for what the server does and
 * does not assume about them.
 */

const NAME_KEY = 'meetup-attendee-name'
const ID_KEY = 'meetup-attendee-id'

export interface Attendee {
  /** The device id. Sent with every write; a claim, never a credential. */
  id: string
  /** What they typed once, or null until they have. */
  name: string | null
}

/**
 * Same-tab subscribers, because the browser's own `storage` event fires only in
 * OTHER tabs. Without this, naming yourself on the Q&A screen would leave the
 * schedule screen's header still saying you were anonymous until a reload.
 */
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((listener) => listener())

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  window.addEventListener('storage', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', listener)
  }
}

/**
 * The device id, created on first read and never changed.
 *
 * `randomUUID` needs a secure context, which `http://` on a venue laptop's LAN
 * address is not — so there is a real fallback rather than a crash on the one
 * night it matters.
 */
function readId(): string {
  const existing = localStorage.getItem(ID_KEY)
  if (existing) {
    return existing
  }
  const created =
    typeof crypto?.randomUUID === 'function'
      ? crypto.randomUUID()
      : `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  localStorage.setItem(ID_KEY, created)
  return created
}

/**
 * The snapshot must be REFERENTIALLY STABLE between changes or
 * `useSyncExternalStore` re-renders forever — a fresh object literal per call is
 * a new reference every time. So it is cached and only rebuilt when a write
 * actually changes something.
 */
let snapshot: Attendee | null = null

function getSnapshot(): Attendee {
  if (!snapshot) {
    snapshot = { id: readId(), name: localStorage.getItem(NAME_KEY) }
  }
  return snapshot
}

/** SSR has no localStorage and no person. One stable object, so the server render is stable too. */
const SERVER_SNAPSHOT: Attendee = { id: '', name: null }
const getServerSnapshot = () => SERVER_SNAPSHOT

export function useAttendee() {
  const attendee = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setName = useCallback((name: string) => {
    const trimmed = name.trim().slice(0, 40)
    if (!trimmed) {
      return
    }
    localStorage.setItem(NAME_KEY, trimmed)
    snapshot = { id: readId(), name: trimmed }
    emit()
  }, [])

  /** Only reachable from the account menu. Nobody needs it; everybody expects it to exist. */
  const forget = useCallback(() => {
    localStorage.removeItem(NAME_KEY)
    snapshot = { id: readId(), name: null }
    emit()
  }, [])

  return {
    ...attendee,
    /** False during SSR and before a name is typed — both mean "do not post yet". */
    isNamed: !!attendee.name && !!attendee.id,
    setName,
    forget,
  }
}
