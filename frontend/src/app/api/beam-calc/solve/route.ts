// src/app/api/beam-calc/solve/route.ts
// ─────────────────────────────────────────────────────────────
//  Frontend proxy for the EngineerCalc backend solver.
//  POST /api/beam-calc/solve  →  POST {BACKEND_BASE_URL}/beam-calc/solve
//
//  BACKEND_BASE_URL matches @/lib/backend: use API root WITH /v1 (e.g. https://host/v1).
//  If omitted, trailing /v1 is appended for parity with backend/main.py prefixes.
//
//  Pass-through behaviour:
//    - Forwards the JSON body verbatim.
//    - Forwards the optional ?units=imperial query param.
//    - Surfaces 422 validation errors with their backend payload
//      (the UI will need the field-level messages to render inline).
//    - Wraps successful results in the canonical {ok, data} envelope used
//      by the rest of the /api/* routes.
// ─────────────────────────────────────────────────────────────
import { NextResponse } from 'next/server'

/** FastAPI routers are mounted under /v1 — same base as frontend/.env.example and @/lib/backend. */
function backendV1Base(): string {
  const raw = process.env.BACKEND_BASE_URL ?? 'http://localhost:8080'
  const trimmed = raw.replace(/\/$/, '')
  return trimmed.endsWith('/v1') ? trimmed : `${trimmed}/v1`
}

export async function POST(req: Request) {
  const url = new URL(req.url)
  const units = url.searchParams.get('units')
  const qs = units ? `?units=${encodeURIComponent(units)}` : ''

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Request body must be valid JSON.' },
      { status: 400 },
    )
  }

  let res: Response
  try {
    res = await fetch(`${backendV1Base()}/beam-calc/solve${qs}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    })
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error:
          err instanceof Error
            ? `Backend unreachable: ${err.message}`
            : 'Backend unreachable.',
      },
      { status: 502 },
    )
  }

  // 422 → forward the backend's structured error so the UI can render
  // field-level messages without re-doing validation client-side.
  if (res.status === 422) {
    const detail = await res.json().catch(() => ({}))
    return NextResponse.json({ ok: false, error: 'Validation failed.', detail }, { status: 422 })
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    return NextResponse.json(
      { ok: false, error: `Backend error (${res.status}).`, detail: text },
      { status: res.status },
    )
  }

  const data = await res.json()
  return NextResponse.json({ ok: true, data }, { status: 200 })
}
