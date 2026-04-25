import { NextResponse } from "next/server"
import { getIngestionLatest } from "@/lib/backend"

export async function GET() {
  try {
    const data = await getIngestionLatest()
    return NextResponse.json({ ok: true, data }, { status: 200 })
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 400 },
    )
  }
}
