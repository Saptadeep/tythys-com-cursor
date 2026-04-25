import { AppShell } from "@/components/layout/AppShell"
import { getEndpointsHealth, type EndpointHealthDTO } from "@/lib/backend"

export default async function EndpointsPage() {
  let rows: EndpointHealthDTO[] = []
  try {
    rows = await getEndpointsHealth()
  } catch {
    rows = []
  }

  return (
    <main>
      <AppShell>
        <section className="card" style={{ padding: 16 }}>
          <h2 className="section-title">Endpoints</h2>
          <p className="h2">Endpoint health (latest rollups)</p>
          {rows.length === 0 ? (
            <p className="note">No rollup data yet. Requires Postgres + ingestion + background worker.</p>
          ) : (
            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              {rows.map((r, idx) => (
                <article key={`${r.service_id}-${r.route}-${idx}`} className="metric">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ fontWeight: 700 }}>
                      {r.service_id} · {r.route}
                    </div>
                    <span className={`status ${r.health === "healthy" ? "ok" : r.health === "degraded" ? "warn" : "err"}`}>
                      {r.health}
                    </span>
                  </div>
                  <div className="note" style={{ marginTop: 8 }}>
                    req={r.request_count} err={r.error_count} p95~{r.p95_latency_ms.toFixed(1)}ms
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </AppShell>
    </main>
  )
}
