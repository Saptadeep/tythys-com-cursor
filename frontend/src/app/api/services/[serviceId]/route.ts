import { NextResponse } from "next/server"
import { getServiceSummary } from "@/lib/backend"

type Params = { params: Promise<{ serviceId: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { serviceId } = await params
  try {
    const data = await getServiceSummary(serviceId)
    return NextResponse.json({ ok: true, data }, { status: 200 })
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 400 },
    )
  }
}
