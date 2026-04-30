const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export type TurnstileVerifyResult = {
  ok: boolean
  errorCodes?: string[]
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
