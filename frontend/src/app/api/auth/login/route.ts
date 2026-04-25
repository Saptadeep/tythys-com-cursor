import { NextResponse } from "next/server"

const DEMO_SECRET = process.env.DEMO_AUTH_SECRET ?? "letmein-demo"

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { email?: string; secret?: string } | null
  if (!body?.email || !body?.secret) {
    return NextResponse.json({ ok: false, error: "Email and secret are required." }, { status: 400 })
  }
  if (body.secret !== DEMO_SECRET) {
    return NextResponse.json({ ok: false, error: "Invalid demo secret." }, { status: 401 })
  }
  return NextResponse.json({
    ok: true,
    token: "mock-demo-jwt-token",
    user: { email: body.email, provider: "demo-secret" },
  })
}
