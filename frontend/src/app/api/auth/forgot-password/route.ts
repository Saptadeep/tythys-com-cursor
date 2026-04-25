import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { email?: string } | null
  if (!body?.email) {
    return NextResponse.json({ ok: false, error: "Email is required." }, { status: 400 })
  }
  return NextResponse.json({
    ok: true,
    mode: "mock",
    message: "Reset workflow simulated.",
  })
}
