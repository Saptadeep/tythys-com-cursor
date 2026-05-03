/**
 * FastAPI mounts routers under /v1 (see backend/app/main.py).
 * BACKEND_BASE_URL may be the origin only or already end with /v1.
 */
export function backendV1Base(fallbackWhenUnset?: string): string {
  const raw = process.env.BACKEND_BASE_URL ?? fallbackWhenUnset
  if (!raw?.trim()) {
    throw new Error('Missing BACKEND_BASE_URL.')
  }
  const trimmed = raw.replace(/\/$/, '')
  return trimmed.endsWith('/v1') ? trimmed : `${trimmed}/v1`
}
