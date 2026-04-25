import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { email?: string; fullName?: string } | null
  if (!body?.email || !body?.fullName) {
    return NextResponse.json({ ok: false, error: "Missing required fields." }, { status: 400 })
  }
  return NextResponse.json({
    ok: true,
    mode: "mock",
    userId: "mock-user-001",
    message: "Mock signup accepted.",
  })
}
