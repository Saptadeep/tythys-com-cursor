const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? 'https://tythys.com,https://www.tythys.com')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

function isVercelPreview(origin: string): boolean {
  try {
    const url = new URL(origin)
    return url.hostname.endsWith('.vercel.app')
  } catch {
    return false
  }
}

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true
  if (ALLOWED_ORIGINS.includes(origin)) return true
  if (isVercelPreview(origin)) return true
  if (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost')) return true
  return false
}

export function enforceSameOrigin(req: Request): { ok: true } | { ok: false; reason: string } {
  const origin = req.headers.get('origin')
  const host = req.headers.get('host')

  if (!origin) {
    return { ok: true }
  }

  if (isAllowedOrigin(origin)) {
    return { ok: true }
  }

  if (host) {
    try {
      const o = new URL(origin)
      if (o.host === host) return { ok: true }
    } catch {
      // fall through
    }
  }

  return { ok: false, reason: 'Origin not allowed.' }
}

export function getAllowedOrigins(): string[] {
  return [...ALLOWED_ORIGINS]
}
