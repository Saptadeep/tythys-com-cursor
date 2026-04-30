import type { NextRequest } from 'next/server'

type Bucket = {
  count: number
  resetAt: number
}

const BUCKETS = new Map<string, Bucket>()

export function getClientIp(req: Request | NextRequest): string {
  const headers = req.headers
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }
  return headers.get('x-real-ip') ?? 'unknown'
}

export type RateLimitResult = {
  ok: boolean
  remaining: number
  retryAfterSec: number
}

export type RateLimitOptions = {
  key: string
  limit: number
  windowMs: number
}

export function checkRateLimit(req: Request | NextRequest, opts: RateLimitOptions): RateLimitResult {
  const ip = getClientIp(req)
  const now = Date.now()
  const bucketKey = `${opts.key}:${ip}`
  const bucket = BUCKETS.get(bucketKey)

  if (!bucket || bucket.resetAt < now) {
    BUCKETS.set(bucketKey, { count: 1, resetAt: now + opts.windowMs })
    return { ok: true, remaining: opts.limit - 1, retryAfterSec: 0 }
  }

  if (bucket.count >= opts.limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    }
  }

  bucket.count += 1
  return { ok: true, remaining: opts.limit - bucket.count, retryAfterSec: 0 }
}

const MAX_BUCKETS = 5000

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    if (BUCKETS.size > MAX_BUCKETS) {
      const now = Date.now()
      for (const [k, b] of BUCKETS) {
        if (b.resetAt < now) BUCKETS.delete(k)
      }
    }
  }, 60_000).unref?.()
}
