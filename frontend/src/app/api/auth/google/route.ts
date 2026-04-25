import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json({
    ok: true,
    mode: "mock",
    user: { email: "demo.user@gmail.com", provider: "google" },
  })
}
