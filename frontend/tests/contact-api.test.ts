import { describe, expect, test, beforeAll, afterEach, vi } from 'vitest'

beforeAll(() => {
  process.env.TURNSTILE_SECRET_KEY = 'test-secret'
  process.env.ALLOWED_ORIGINS = 'https://tythys.com,https://www.tythys.com'
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

import { POST } from '@/app/api/contact/route'

function makePost(body: unknown, headers: Record<string, string> = {}) {
  return new Request('https://tythys.com/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', origin: 'https://tythys.com', ...headers },
    body: JSON.stringify(body),
  })
}

describe('POST /api/contact hardening', () => {
  test('rejects requests with disallowed origin', async () => {
    const res = await POST(
      makePost(
        { firstName: 'Alex', email: 'alex@example.com' },
        { origin: 'https://evil.example' },
      ),
    )
    expect(res.status).toBe(403)
  }, 15000)

  test('rejects missing turnstile token when secret is configured', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ success: false }), { status: 200 })),
    )
    const res = await POST(
      makePost({
        firstName: 'Alex',
        email: 'alex@example.com',
        message: 'hello',
      }),
    )
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.ok).toBe(false)
    expect(String(json.error)).toMatch(/verification step did not complete/i)
  }, 15000)

  test('discards submissions that fill the honeypot field', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ success: true }), { status: 200 })),
    )
    const res = await POST(
      makePost({
        firstName: 'Bot',
        email: 'bot@example.com',
        message: 'spam',
        website: 'http://spammy.example',
        turnstileToken: 'tok',
      }),
    )
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toEqual({ ok: true, mode: 'discarded' })
  }, 15000)
})
