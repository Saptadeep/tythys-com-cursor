import { NextResponse } from 'next/server'
import { fetchBackend, isRealBackendMode } from '@/lib/backend/proxy'

export async function GET() {
  try {
    if (isRealBackendMode()) {
      const data = await fetchBackend('/ingest/events/latest', { withIngestKey: true })
      return NextResponse.json({ ok: true, data }, { status: 200 })
    }

    return NextResponse.json(
      {
        ok: true,
        data: {
          service_id: 'api-gateway-observability',
          total_events: 0,
          last_event_at: null,
          recent_event_count: 0,
          error_events_last_window: 0,
        },
      },
      { status: 200 },
    )
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Failed to fetch ingestion status' },
      { status: 400 },
    )
  }
}
