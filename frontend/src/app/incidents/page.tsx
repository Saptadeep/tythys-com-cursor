import { AppShell } from "@/components/layout/AppShell"

export default function IncidentsPage() {
  return (
    <main>
      <AppShell>
        <section className="card" style={{ padding: 16 }}>
          <h2 className="section-title">Incidents Module</h2>
          <p className="h2">Incident Queue (placeholder)</p>
          <p className="note">
            This page is intentionally scaffolded for future live incident APIs, workflow states, and escalation policies.
          </p>
        </section>
      </AppShell>
    </main>
  )
}
