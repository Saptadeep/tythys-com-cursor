import { NextResponse } from 'next/server'
import { z } from 'zod'
import { checkRateLimit, getClientIp } from '@/lib/security/rateLimit'
import { verifyTurnstile } from '@/lib/security/verifyTurnstile'
import { parseJson } from '@/lib/security/validate'
import { enforceSameOrigin } from '@/lib/security/csrf'

const ContactSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required.').max(80),
  lastName: z.string().trim().max(80).optional().default(''),
  email: z.string().trim().email('A valid email is required.').max(160),
  interest: z.string().trim().max(120).optional().default(''),
  message: z.string().trim().max(4000).optional().default(''),
  website: z.string().max(2048).optional().default(''),
  turnstileToken: z.string().max(2048).optional().default(''),
})

function csvEscape(value: string) {
  const needsQuotes = /[",\n\r]/.test(value)
  const escaped = value.replaceAll('"', '""')
  return needsQuotes ? `"${escaped}"` : escaped
}

export async function POST(req: Request) {
  const origin = enforceSameOrigin(req)
  if (!origin.ok) {
    return NextResponse.json({ ok: false, error: 'Forbidden origin.' }, { status: 403 })
  }

  const rl = checkRateLimit(req, { key: 'contact', limit: 5, windowMs: 60_000 })
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } },
    )
  }

  const parsed = await parseJson(req, ContactSchema)
  if (!parsed.ok) return parsed.response
  const data = parsed.data

  if (data.website && data.website.length > 0) {
    return NextResponse.json({ ok: true, mode: 'discarded' }, { status: 200 })
  }

  const turnstile = await verifyTurnstile(data.turnstileToken, getClientIp(req))
  if (!turnstile.ok) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'The form verification step did not complete. Please try again in a few seconds.',
      },
      { status: 400 },
    )
  }

  const timestamp = new Date().toISOString().replaceAll(':', '-')
  const csvHeader = ['timestamp', 'firstName', 'lastName', 'email', 'interest', 'message'].join(',')
  const csvRow = [timestamp, data.firstName, data.lastName, data.email, data.interest, data.message]
    .map(csvEscape)
    .join(',')
  const csvContent = `${csvHeader}\n${csvRow}\n`
  const csvFilename = `tythys-contact-${timestamp}.csv`

  const to = process.env.CONTACT_TO ?? 'sd@tythys.com'
  const from = process.env.CONTACT_FROM ?? 'TythysOne <onboarding@resend.dev>'
  const resendKey = process.env.RESEND_API_KEY

  const subject = `TythysOne contact — ${data.firstName}${data.lastName ? ` ${data.lastName}` : ''} (${data.email})`
  const text = [
    'New message from TythysOne contact form',
    '',
    `Name: ${data.firstName}${data.lastName ? ` ${data.lastName}` : ''}`,
    `Email: ${data.email}`,
    `Interest: ${data.interest || '(not selected)'}`,
    '',
    'Message:',
    data.message || '(empty)',
    '',
    `Timestamp: ${timestamp}`,
  ].join('\n')

  if (!resendKey) {
    console.info('[CONTACT_OK_FALLBACK]', { ts: timestamp, email: data.email, interest: data.interest || null })
    const webhookUrl = process.env.CONTACT_FALLBACK_WEBHOOK_URL
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          interest: data.interest,
          message: data.message,
          csvFilename,
          csvContent,
        }),
      }).catch(() => null)
    }
    return NextResponse.json({ ok: true, mode: 'owner_fallback' }, { status: 200 })
  }

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: data.email,
      subject,
      text,
    }),
  }).catch(() => null)

  if (!resp || !resp.ok) {
    const errText = resp ? await resp.text().catch(() => '') : 'Network error'
    console.error('[CONTACT_EMAIL_FAILED]', errText.slice(0, 200) || 'Unknown error')
    const webhookUrl = process.env.CONTACT_FALLBACK_WEBHOOK_URL
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          interest: data.interest,
          message: data.message,
          csvFilename,
          csvContent,
          emailError: (errText || 'Unknown error').slice(0, 500),
        }),
      }).catch(() => null)
    }
    return NextResponse.json({ ok: true, mode: 'owner_fallback' }, { status: 200 })
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
