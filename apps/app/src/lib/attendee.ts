import { useCallback, useSyncExternalStore } from 'react'

const NAME_KEY = 'meetup-attendee-name'
const ID_KEY = 'meetup-attendee-id'

export interface Attendee {
  id: string
  name: string | null
}

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

let snapshot: Attendee | null = null

function getSnapshot(): Attendee {
  if (!snapshot) {
    snapshot = { id: readId(), name: localStorage.getItem(NAME_KEY) }
  }
  return snapshot
}

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

  const forget = useCallback(() => {
    localStorage.removeItem(NAME_KEY)
    snapshot = { id: readId(), name: null }
    emit()
  }, [])

  return {
    ...attendee,
    isNamed: !!attendee.name && !!attendee.id,
    setName,
    forget,
  }
}
