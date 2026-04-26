import { NextResponse } from 'next/server'
import { getServiceSummary } from '@/lib/backend/registry'

type Params = { params: Promise<{ serviceId: string }> }

export async function GET(req: Request, { params }: Params) {
  const { serviceId } = await params
  try {
    const userId = req.headers.get('x-user-id') ?? undefined
    const authHeader = req.headers.get('authorization') ?? undefined
    const authToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined

    const summary = await getServiceSummary(serviceId, { userId, authToken })
    return NextResponse.json({ ok: true, data: summary }, { status: 200 })
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : 'Failed to fetch service summary',
      },
      { status: 400 },
    )
  }
}
