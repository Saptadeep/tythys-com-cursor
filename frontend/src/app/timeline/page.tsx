import { AppShell } from "@/components/layout/AppShell"

export default function TimelinePage() {
  return (
    <main>
      <AppShell>
        <section className="card" style={{ padding: 16 }}>
          <h2 className="section-title">Timeline Module</h2>
          <p className="h2">Operational Timeline (placeholder)</p>
          <p className="note">
            Planned extension: merge deployment events, anomaly detections, and incident actions into a single timeline.
          </p>
        </section>
      </AppShell>
    </main>
  )
}
