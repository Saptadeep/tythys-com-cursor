'use client'

import { FormEvent, useState } from "react"
import { AppShell } from "@/components/layout/AppShell"

export default function SignupPage() {
  const [status, setStatus] = useState("")

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    })
    const json = await res.json()
    setStatus(json.ok ? "Mock signup created." : json.error)
  }

  return (
    <main>
      <AppShell>
        <section className="card" style={{ padding: 16, maxWidth: 640 }}>
          <h2 className="section-title">Authentication Module</h2>
          <p className="h2">Sign up (mock)</p>
          <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
            <input className="field" name="fullName" required placeholder="Full name" />
            <input className="field" name="email" required type="email" placeholder="Work email" />
            <button className="btn btn-primary" type="submit">Create account</button>
          </form>
          {!!status && <p className="note">{status}</p>}
        </section>
      </AppShell>
    </main>
  )
}
