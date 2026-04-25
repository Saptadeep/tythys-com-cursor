import { NextResponse } from "next/server"

export async function GET() {
  const base = process.env.BACKEND_BASE_URL
  if (!base) {
    return NextResponse.json({ ok: true, data: [] }, { status: 200 })
  }
  const url = `${base.replace(/\/$/, "")}/incidents/current`
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) {
    return NextResponse.json({ ok: false, error: `Backend error ${res.status}` }, { status: 502 })
  }
  const data = await res.json()
  return NextResponse.json({ ok: true, data }, { status: 200 })
}
