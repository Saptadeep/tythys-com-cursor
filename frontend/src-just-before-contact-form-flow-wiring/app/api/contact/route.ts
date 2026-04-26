import { NextResponse } from 'next/server'

type ContactPayload = {
  firstName: string
  lastName?: string
  email: string
  interest?: string
  message?: string
}

function asString(v: unknown) {
  return typeof v === 'string' ? v.trim() : ''
}

function csvEscape(value: string) {
  const needsQuotes = /[",\n\r]/.test(value)
  const escaped = value.replaceAll('"', '""')
  return needsQuotes ? `"${escaped}"` : escaped
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as unknown
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 })
  }

  const data = body as Partial<ContactPayload>
  const firstName = asString(data.firstName)
  const lastName = asString(data.lastName)
  const email = asString(data.email)
  const interest = asString(data.interest)
  const message = asString(data.message)

  if (!firstName) {
    return NextResponse.json({ ok: false, error: 'First name is required.' }, { status: 400 })
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: 'A valid email is required.' }, { status: 400 })
  }

  const timestamp = new Date().toISOString().replaceAll(':', '-')
  const csvHeader = ['timestamp', 'firstName', 'lastName', 'email', 'interest', 'message'].join(',')
  const csvRow = [
    timestamp,
    firstName,
    lastName,
    email,
    interest,
    message,
  ].map(csvEscape).join(',')
  const csvContent = `${csvHeader}\n${csvRow}\n`
  const csvFilename = `tythys-contact-${timestamp}.csv`

  const to = process.env.CONTACT_TO ?? 'sd@tythys.com'
  const from = process.env.CONTACT_FROM ?? 'TythysOne <onboarding@resend.dev>'
  const resendKey = process.env.RESEND_API_KEY

  const subject = `TythysOne contact — ${firstName}${lastName ? ` ${lastName}` : ''} (${email})`
  const text = [
    'New message from TythysOne contact form',
    '',
    `Name: ${firstName}${lastName ? ` ${lastName}` : ''}`,
    `Email: ${email}`,
    `Interest: ${interest || '(not selected)'}`,
    '',
    'Message:',
    message || '(empty)',
    '',
    `Timestamp: ${timestamp}`,
    '',
    'CSV:',
    csvContent.trimEnd(),
    '',
  ].join('\n')

  if (!resendKey) {
    // Vercel functions cannot reliably persist files long-term; provide CSV fallback.
    return NextResponse.json(
      {
        ok: false,
        mode: 'csv_fallback',
        error: 'Email is not configured on the server (missing RESEND_API_KEY).',
        csvFilename,
        csvContent,
      },
      { status: 501 },
    )
  }

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject,
      text,
    }),
  }).catch(() => null)

  if (!resp || !resp.ok) {
    const errText = resp ? await resp.text().catch(() => '') : 'Network error'
    return NextResponse.json(
      {
        ok: false,
        mode: 'csv_fallback',
        error: `Failed to send email.${errText ? ` ${errText}` : ''}`,
        csvFilename,
        csvContent,
      },
      { status: 502 },
    )
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
