'use client'

import Link from "next/link"
import { FormEvent, useState } from "react"
import { AppShell } from "@/components/layout/AppShell"

export default function LoginPage() {
  const [message, setMessage] = useState("")

  async function loginWithDemo(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    })
    const json = await res.json()
    setMessage(json.ok ? `Mock login success. Token: ${json.token}` : json.error)
  }

  async function loginWithGoogleMock() {
    const res = await fetch("/api/auth/google", { method: "POST" })
    const json = await res.json()
    setMessage(json.ok ? "Mock Google SSO success." : json.error)
  }

  return (
    <main>
      <AppShell>
        <section className="card" style={{ padding: 16, maxWidth: 640 }}>
          <h2 className="section-title">Authentication Module</h2>
          <p className="h2">Login (mock)</p>
          <form onSubmit={loginWithDemo} style={{ display: "grid", gap: 10, marginTop: 8 }}>
            <input className="field" name="email" type="email" required placeholder="Email" />
            <input className="field" name="secret" required placeholder="Demo secret" />
            <button className="btn btn-primary" type="submit">Login with demo secret</button>
          </form>
          <button className="btn" style={{ marginTop: 10 }} onClick={loginWithGoogleMock}>
            Continue with Google (mock)
          </button>
          {!!message && <p className="note" style={{ marginTop: 10 }}>{message}</p>}
          <p className="note">
            <Link href="/auth/signup">Sign up</Link> · <Link href="/auth/forgot-password">Forgot password</Link>
          </p>
        </section>
      </AppShell>
    </main>
  )
}
