'use client'

import { FormEvent, useState } from "react"
import { AppShell } from "@/components/layout/AppShell"

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState("")

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    })
    const json = await res.json()
    setStatus(json.ok ? "Mock reset link sent." : json.error)
  }

  return (
    <main>
      <AppShell>
        <section className="card" style={{ padding: 16, maxWidth: 640 }}>
          <h2 className="section-title">Authentication Module</h2>
          <p className="h2">Forgot password (mock)</p>
          <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
            <input className="field" name="email" type="email" required placeholder="Work email" />
            <button className="btn btn-primary" type="submit">Send reset link</button>
          </form>
          {!!status && <p className="note">{status}</p>}
        </section>
      </AppShell>
    </main>
  )
}
