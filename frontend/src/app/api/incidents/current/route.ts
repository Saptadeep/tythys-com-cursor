import { NextResponse } from 'next/server'
import { fetchBackend, isRealBackendMode } from '@/lib/backend/proxy'

export async function GET() {
  try {
    if (isRealBackendMode()) {
      const data = await fetchBackend('/incidents/current')
      return NextResponse.json({ ok: true, data }, { status: 200 })
    }

    return NextResponse.json({ ok: true, data: [] }, { status: 200 })
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Failed to fetch incidents' },
      { status: 400 },
    )
  }
}
