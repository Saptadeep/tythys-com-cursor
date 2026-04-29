// src/app/api/beam-calc/solve/route.ts
// ─────────────────────────────────────────────────────────────
//  Frontend proxy for the EngineerCalc backend solver.
//  POST /api/beam-calc/solve  →  POST {BACKEND_BASE_URL}/v1/beam-calc/solve
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

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL ?? 'http://localhost:8080'

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
    res = await fetch(`${BACKEND_BASE_URL}/v1/beam-calc/solve${qs}`, {
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
