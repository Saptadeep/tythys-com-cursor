type FetchOptions = {
  method?: 'GET' | 'POST'
  body?: unknown
  withIngestKey?: boolean
}

export function isRealBackendMode() {
  return process.env.BACKEND_MODE === 'real'
}

function backendBaseUrl() {
  const base = process.env.BACKEND_BASE_URL
  if (!base) {
    throw new Error('Missing BACKEND_BASE_URL.')
  }
  return base.replace(/\/$/, '')
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

  const res = await fetch(`${backendBaseUrl()}${path}`, {
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
