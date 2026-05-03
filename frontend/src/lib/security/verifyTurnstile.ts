const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export type TurnstileVerifyResult = {
  ok: boolean
  errorCodes?: string[]
}

/** User-facing explanation aligned with Cloudflare Turnstile error-codes. */
export function turnstileFailureUserMessage(errorCodes?: string[]): string {
  const codes = new Set(errorCodes ?? [])

  if (codes.has('missing-token') || codes.has('missing-input-response')) {
    return 'Verification did not finish: wait for the check below to complete, then send again. If nothing loads, refresh the page.'
  }
  if (codes.has('timeout-or-duplicate')) {
    return 'That verification expired or was already used. Refresh the page for a new check, then send your message.'
  }
  if (codes.has('invalid-input-response')) {
    return 'Verification could not be confirmed. Complete the check again (or refresh the page) before sending.'
  }
  if ([...codes].some((c) => typeof c === 'string' && c.startsWith('http-'))) {
    return 'Could not reach the verification service. Check your connection and try again.'
  }
  if (codes.has('network-error')) {
    return 'Could not reach the verification service. Check your connection and try again.'
  }
  if (codes.has('missing-secret') || codes.has('invalid-input-secret')) {
    return 'This site cannot complete spam protection right now (server configuration). Please try again later or use the email address shown on the site.'
  }
  if (codes.has('bad-request')) {
    return 'Verification data was rejected. Refresh the page and complete the check again.'
  }
  if (codes.has('internal-error')) {
    return 'The verification provider had a temporary error. Wait a moment, refresh, and try again.'
  }

  return 'Verification did not complete. Please try again in a few seconds.'
}

export async function verifyTurnstile(token: string | null | undefined, remoteIp?: string): Promise<TurnstileVerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      return { ok: false, errorCodes: ['missing-secret'] }
    }
    return { ok: true }
  }

  if (!token) {
    return { ok: false, errorCodes: ['missing-token'] }
  }

  const form = new URLSearchParams()
  form.set('secret', secret)
  form.set('response', token)
  if (remoteIp) form.set('remoteip', remoteIp)

  try {
    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
      cache: 'no-store',
    })
    if (!res.ok) {
      return { ok: false, errorCodes: [`http-${res.status}`] }
    }
    const data = (await res.json()) as { success?: boolean; 'error-codes'?: string[] }
    return { ok: !!data.success, errorCodes: data['error-codes'] }
  } catch {
    return { ok: false, errorCodes: ['network-error'] }
  }
}
