import { AppShell } from "@/components/layout/AppShell"
import { HudPlaceholder } from "@/components/layout/HudPlaceholder"
import { internalOrigin } from "@/lib/internalOrigin"

type SummaryResponse = {
  ok: boolean
  data?: {
    serviceId: string
    health: "healthy" | "degraded" | "down"
    latencyMs: number
    uptimePct: number
    requestsPerMin: number
    errorRatePct: number
    notes?: string
  }
  error?: string
}

type IngestResponse = {
  ok: boolean
  data?: {
    service_id: string | null
    total_events: number
    last_event_at: string | null
    recent_event_count: number
    error_events_last_window: number
  }
  error?: string
}

async function getSummary(): Promise<SummaryResponse> {
  const res = await fetch(`${internalOrigin()}/api/services/api-gateway-observability`, {
    cache: "no-store",
  }).catch(() => null)
  if (!res) return { ok: false, error: "Cannot reach frontend API route." }
  return (await res.json()) as SummaryResponse
}

async function getIngestionStatus(): Promise<IngestResponse> {
  const res = await fetch(`${internalOrigin()}/api/ingest/latest`, {
    cache: "no-store",
  }).catch(() => null)
  if (!res) return { ok: false, error: "Cannot reach ingestion API route." }
  return (await res.json()) as IngestResponse
}

export default async function Home() {
  const [summary, ingestion] = await Promise.all([getSummary(), getIngestionStatus()])
  const data = summary.data
  const ingestData = ingestion.data

  return (
    <main>
      <AppShell>
        {!summary.ok || !data ? (
          <section className="card" style={{ padding: 16, borderColor: "rgba(255,102,102,0.4)" }}>
            <h2 className="section-title">Backend Status</h2>
            <p className="h2">Connection error</p>
            <p className="note">{summary.error ?? "Unknown error"}</p>
          </section>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            <div className="grid-2">
              <section className="card" style={{ padding: 16 }}>
                <h2 className="section-title">Primary Service</h2>
                <p className="h2">GatewaySight Summary</p>
                <div className="grid-3" style={{ marginTop: 14 }}>
                  <Metric label="Health" value={data.health.toUpperCase()} />
                  <Metric label="Latency" value={`${data.latencyMs} ms`} />
                  <Metric label="Uptime" value={`${data.uptimePct.toFixed(2)}%`} />
                  <Metric label="Requests / min" value={data.requestsPerMin.toString()} />
                  <Metric label="Error Rate" value={`${data.errorRatePct.toFixed(2)}%`} />
                  <Metric label="Service Id" value={data.serviceId} />
                </div>
                {data.notes && <p className="note" style={{ marginTop: 14 }}>{data.notes}</p>}
              </section>

              <section className="card" style={{ padding: 16 }}>
                <h2 className="section-title">Fix First Queue</h2>
                <p className="h2">Prioritized Response Actions</p>
                <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                  <PriorityItem
                    name="Investigate /checkout gateway route"
                    status={data.health}
                    meta={`Latency drift at ${data.latencyMs} ms, monitor for escalation.`}
                  />
                  <PriorityItem
                    name="Review upstream timeout policy"
                    status={data.errorRatePct > 0.8 ? "degraded" : "healthy"}
                    meta={`Current error rate ${data.errorRatePct.toFixed(2)}%, keep below 0.50%.`}
                  />
                  <PriorityItem
                    name="Validate request burst budget"
                    status={data.requestsPerMin > 1500 ? "degraded" : "healthy"}
                    meta={`${data.requestsPerMin} req/min currently observed on gateway ingress.`}
                  />
                </div>
              </section>
            </div>
            <section className="card" style={{ padding: 16 }}>
              <h2 className="section-title">Ingestion Status</h2>
              {!ingestion.ok || !ingestData ? (
                <p className="note">{ingestion.error ?? "Ingestion metrics unavailable."}</p>
              ) : (
                <div className="grid-3" style={{ marginTop: 14 }}>
                  <Metric label="Service Id" value={ingestData.service_id ?? "n/a"} />
                  <Metric label="Total Events" value={ingestData.total_events.toString()} />
                  <Metric label="Recent Window" value={ingestData.recent_event_count.toString()} />
                  <Metric label="5xx In Window" value={ingestData.error_events_last_window.toString()} />
                  <Metric
                    label="Last Event At"
                    value={ingestData.last_event_at ? new Date(ingestData.last_event_at).toLocaleTimeString() : "n/a"}
                  />
                </div>
              )}
            </section>
            <HudPlaceholder />
          </div>
        )}
      </AppShell>
    </main>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <div className="metric-k">{label}</div>
      <div className="metric-v">{value}</div>
    </div>
  )
}

function PriorityItem({
  name,
  status,
  meta,
}: {
  name: string
  status: "healthy" | "degraded" | "down"
  meta: string
}) {
  const statusClass = `status ${status === "healthy" ? "ok" : status === "degraded" ? "warn" : "err"}`
  return (
    <article className="metric">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{name}</div>
        <span className={statusClass}>{status}</span>
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-2)" }}>{meta}</div>
    </article>
  )
}
