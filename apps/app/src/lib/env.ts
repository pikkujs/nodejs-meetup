export function apiUrl(): string {
  if (import.meta.env.SSR) {
    return import.meta.env.VITE_API_URL ?? '/__api'
  }
  const configured = import.meta.env.VITE_API_URL
  const remote = !/^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)
  if (configured && !(remote && /\/\/(localhost|127\.0\.0\.1)(:|\/)/.test(configured))) {
    return configured
  }
  return window.location.origin + '/api'
}

export function basePath(): string {
  const base = import.meta.env.BASE_URL || '/'
  return base.endsWith('/') ? base.slice(0, -1) : base
}

export function appHref(path: string): string {
  return `${basePath()}${path}`
}
