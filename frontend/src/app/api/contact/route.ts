import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  if (!body?.email) {
    return NextResponse.json({ ok: false, error: "Missing email." }, { status: 400 })
  }
  return NextResponse.json({
    ok: true,
    mode: "mock",
    message: "Contact request accepted (mock route).",
  })
}
