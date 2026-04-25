'use client'

import { FormEvent, useState } from "react"
import { AppShell } from "@/components/layout/AppShell"

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle")
  const [email, setEmail] = useState("")

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus("sending")
    const form = new FormData(e.currentTarget)
    const payload = Object.fromEntries(form.entries())
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      setEmail(String(payload.email || ""))
      setStatus("sent")
      return
    }
    setStatus("idle")
  }

  return (
    <main>
      <AppShell>
        <section className="card" style={{ padding: 16, maxWidth: 760 }}>
          <h2 className="section-title">Get In Touch Module</h2>
          <p className="h2">Contact Sales / Product Team</p>
          {status === "sent" ? (
            <p className="note">Thanks. We received your request and will contact you at {email}.</p>
          ) : (
            <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
              <input className="field" name="name" required placeholder="Your name" />
              <input className="field" name="email" type="email" required placeholder="Work email" />
              <textarea className="field" name="message" rows={5} placeholder="What are you trying to solve?" />
              <button className="btn btn-primary" disabled={status === "sending"} type="submit">
                {status === "sending" ? "Sending..." : "Submit"}
              </button>
            </form>
          )}
        </section>
      </AppShell>
    </main>
  )
}
