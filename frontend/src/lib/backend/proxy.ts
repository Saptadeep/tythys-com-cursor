import { backendV1Base } from './baseUrl'

type FetchOptions = {
  method?: 'GET' | 'POST'
  body?: unknown
  withIngestKey?: boolean
}

export function isRealBackendMode() {
  return process.env.BACKEND_MODE === 'real'
}

export async function fetchBackend(path: string, options: FetchOptions = {}) {
  const { method = 'GET', body, withIngestKey = false } = options
  const headers: Record<string, string> = {}

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  if (withIngestKey && process.env.INGEST_API_KEY) {
    headers['x-api-key'] = process.env.INGEST_API_KEY
  }

  const res = await fetch(`${backendV1Base()}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`Backend request failed (${res.status}) for ${path}`)
  }

  return res.json()
}
