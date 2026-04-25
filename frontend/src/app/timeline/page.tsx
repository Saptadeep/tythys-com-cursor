import { AppShell } from "@/components/layout/AppShell"
import { getTimeline, type TimelineEventDTO } from "@/lib/backend"

export default async function TimelinePage() {
  let events: TimelineEventDTO[] = []
  try {
    events = await getTimeline()
  } catch {
    events = []
  }

  return (
    <main>
      <AppShell>
        <section className="card" style={{ padding: 16 }}>
          <h2 className="section-title">Timeline</h2>
          <p className="h2">Operational timeline</p>
          {events.length === 0 ? (
            <p className="note">No timeline events yet.</p>
          ) : (
            <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
              {events.map((e, idx) => (
                <div key={`${e.ts}-${idx}`} className="metric">
                  <div style={{ fontSize: 12, color: "var(--text-2)" }}>
                    {new Date(e.ts).toLocaleString()} · {e.kind}
                  </div>
                  <div style={{ marginTop: 6 }}>{e.message}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </AppShell>
    </main>
  )
}
