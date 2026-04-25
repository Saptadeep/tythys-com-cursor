import { AppShell } from "@/components/layout/AppShell"
import { getActionsPrioritized, getIncidentsCurrent, type ActionDTO, type IncidentDTO } from "@/lib/backend"

export default async function IncidentsPage() {
  let incidents: IncidentDTO[] = []
  let actions: ActionDTO[] = []
  try {
    incidents = await getIncidentsCurrent()
    actions = await getActionsPrioritized()
  } catch {
    incidents = []
    actions = []
  }

  return (
    <main>
      <AppShell>
        <div className="grid-2">
          <section className="card" style={{ padding: 16 }}>
            <h2 className="section-title">Incidents</h2>
            <p className="h2">Current open incidents</p>
            {incidents.length === 0 ? (
              <p className="note">No incidents yet. Ingest traffic with Postgres enabled and wait for rollup cycles.</p>
            ) : (
              <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                {incidents.map((i) => (
                  <article key={i.id} className="metric">
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ fontWeight: 700 }}>{i.title}</div>
                      <span className={`status ${i.severity === "high" ? "err" : i.severity === "medium" ? "warn" : "ok"}`}>
                        {i.severity}
                      </span>
                    </div>
                    <div className="note" style={{ marginTop: 8 }}>
                      {i.service_id} {i.route ? `· ${i.route}` : ""}
                    </div>
                    <div className="note" style={{ marginTop: 8 }}>
                      Est. loss/hr: ${i.estimated_loss_per_hour_usd.toFixed(2)} · Affected traffic: {i.affected_traffic_pct.toFixed(2)}%
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="card" style={{ padding: 16 }}>
            <h2 className="section-title">Actions</h2>
            <p className="h2">Prioritized mitigation queue</p>
            {actions.length === 0 ? (
              <p className="note">No actions queued yet.</p>
            ) : (
              <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                {actions.map((a) => (
                  <article key={`${a.rank}-${a.title}`} className="metric">
                    <div style={{ fontWeight: 700 }}>
                      #{a.rank} {a.title}
                    </div>
                    <div className="note" style={{ marginTop: 8 }}>
                      {a.rationale}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </AppShell>
    </main>
  )
}
