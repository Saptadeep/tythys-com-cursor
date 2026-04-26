'use client'

import { useEffect, useMemo, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ParticleCanvas } from '@/components/ui/ParticleCanvas'
import { HUD } from '@/components/hud/HUD'

type Health = 'healthy' | 'degraded' | 'down'

type SummaryResponse = {
  ok: boolean
  data?: {
    serviceId: string
    health: Health
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
}

type Incident = {
  id: string
  title: string
  severity: string
  route: string | null
  estimated_loss_per_hour_usd: number
  affected_traffic_pct: number
}

type Action = { rank: number; title: string; rationale: string }
type Endpoint = { route: string; health: Health; request_count: number; error_count: number; p95_latency_ms: number }
type TimelineEvent = { ts: string; kind: string; message: string }

type DataResponse<T> = { ok: boolean; data?: T; error?: string }

function statusClass(health: string) {
  return `status ${health === 'healthy' ? 'ok' : health === 'degraded' ? 'warn' : 'err'}`
}

export default function GatewayObservabilityPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<SummaryResponse['data']>()
  const [ingest, setIngest] = useState<IngestResponse['data']>()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [actions, setActions] = useState<Action[]>([])
  const [endpoints, setEndpoints] = useState<Endpoint[]>([])
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      setError(null)
      const results = await Promise.all([
        fetch('/api/services/api-gateway-observability').then((r) => r.json() as Promise<SummaryResponse>),
        fetch('/api/ingest/latest').then((r) => r.json() as Promise<IngestResponse>),
        fetch('/api/incidents/current').then((r) => r.json() as Promise<DataResponse<Incident[]>>),
        fetch('/api/actions/prioritized').then((r) => r.json() as Promise<DataResponse<Action[]>>),
        fetch('/api/endpoints/health').then((r) => r.json() as Promise<DataResponse<Endpoint[]>>),
        fetch('/api/timeline').then((r) => r.json() as Promise<DataResponse<TimelineEvent[]>>),
      ]).catch(() => null)

      if (!mounted) return
      if (!results) {
        setError('Failed to connect to frontend API routes.')
        setLoading(false)
        return
      }

      const [s, i, inc, act, ep, tl] = results
      if (!s.ok || !s.data) {
        setError(s.error ?? 'Gateway summary is unavailable.')
      } else {
        setSummary(s.data)
      }
      if (i.ok) setIngest(i.data)
      if (inc.ok && inc.data) setIncidents(inc.data)
      if (act.ok && act.data) setActions(act.data)
      if (ep.ok && ep.data) setEndpoints(ep.data)
      if (tl.ok && tl.data) setTimeline(tl.data)
      setLoading(false)
    }

    load()
    const id = setInterval(load, 15000)
    return () => {
      mounted = false
      clearInterval(id)
    }
  }, [])

  const headline = useMemo(() => {
    if (loading) return 'Loading live gateway telemetry...'
    if (error) return 'Gateway telemetry unavailable'
    return 'GatewaySight live control view'
  }, [loading, error])

  return (
    <>
      <ParticleCanvas />
      <TopBar />
      <Navbar />
      <HUD />

      <main className="relative z-10" style={{ paddingTop: 'calc(28px + 56px + 2rem)' }}>
        <section className="relative z-10">
          <div className="mx-auto max-w-[1300px] px-4 py-14 sm:px-7 md:px-10 lg:px-16 xl:px-20">
            <section className="card" style={{ padding: 16 }}>
              <span className="eyebrow">GatewaySight</span>
              <h1 className="section-title">API Gateway observability</h1>
              <p className="h2">{headline}</p>
              {error ? <p className="note" style={{ marginTop: 10 }}>{error}</p> : null}
            </section>

            <div className="grid-2" style={{ marginTop: 14 }}>
              <section className="card" style={{ padding: 16 }}>
                <h2 className="section-title">Service Risk Snapshot</h2>
                {!summary ? (
                  <p className="note">Summary is not available yet.</p>
                ) : (
                  <>
                    <p className="h2">Live service telemetry</p>
                    <div className="grid-3" style={{ marginTop: 14 }}>
                      <Metric label="Health" value={summary.health.toUpperCase()} />
                      <Metric label="P95 Latency" value={`${summary.latencyMs} ms`} />
                      <Metric label="Uptime" value={`${summary.uptimePct.toFixed(2)}%`} />
                      <Metric label="Traffic / min" value={summary.requestsPerMin.toString()} />
                      <Metric label="Error Rate" value={`${summary.errorRatePct.toFixed(2)}%`} />
                      <Metric label="Service Id" value={summary.serviceId} />
                    </div>
                    {summary.notes ? <p className="note" style={{ marginTop: 12 }}>{summary.notes}</p> : null}
                  </>
                )}
              </section>

              <section className="card" style={{ padding: 16 }}>
                <h2 className="section-title">Ingestion Status</h2>
                {!ingest ? (
                  <p className="note">Ingestion metrics unavailable.</p>
                ) : (
                  <>
                    <p className="h2">Event pipeline health</p>
                    <div className="grid-3" style={{ marginTop: 14 }}>
                      <Metric label="Service Id" value={ingest.service_id ?? 'n/a'} />
                      <Metric label="Total Events" value={ingest.total_events.toString()} />
                      <Metric label="Recent Window" value={ingest.recent_event_count.toString()} />
                      <Metric label="Errors In Window" value={ingest.error_events_last_window.toString()} />
                      <Metric
                        label="Last Event At"
                        value={ingest.last_event_at ? new Date(ingest.last_event_at).toLocaleTimeString() : 'n/a'}
                      />
                    </div>
                  </>
                )}
              </section>
            </div>

            <div className="grid-2" style={{ marginTop: 14 }}>
              <section className="card" style={{ padding: 16 }}>
                <h2 className="section-title">Current Incidents</h2>
                <p className="h2">Severity and estimated impact</p>
                {incidents.length === 0 ? (
                  <p className="note">No active incidents detected.</p>
                ) : (
                  <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
                    {incidents.slice(0, 4).map((incident) => (
                      <article key={incident.id} className="metric">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                          <div style={{ fontWeight: 700 }}>{incident.title}</div>
                          <span className={statusClass(incident.severity)}>{incident.severity}</span>
                        </div>
                        <div className="note" style={{ marginTop: 8 }}>
                          {incident.route ?? 'route n/a'} · Loss/hr ${incident.estimated_loss_per_hour_usd.toFixed(2)}
                        </div>
                        <div className="note">Affected traffic {incident.affected_traffic_pct.toFixed(2)}%</div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="card" style={{ padding: 16 }}>
                <h2 className="section-title">Fix First Queue</h2>
                <p className="h2">Prioritized response actions</p>
                {actions.length === 0 ? (
                  <p className="note">No actions queued yet.</p>
                ) : (
                  <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
                    {actions.slice(0, 4).map((action) => (
                      <article key={`${action.rank}-${action.title}`} className="metric">
                        <div style={{ fontWeight: 700 }}>#{action.rank} {action.title}</div>
                        <div className="note" style={{ marginTop: 8 }}>{action.rationale}</div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <section className="card" style={{ padding: 16, marginTop: 14 }}>
              <h2 className="section-title">Endpoint Reliability</h2>
              <p className="h2">Latest route health and pressure</p>
              {endpoints.length === 0 ? (
                <p className="note">No endpoint rollups available yet.</p>
              ) : (
                <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
                  {endpoints.slice(0, 6).map((endpoint, idx) => (
                    <article key={`${endpoint.route}-${idx}`} className="metric">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                        <div style={{ fontWeight: 700 }}>{endpoint.route}</div>
                        <span className={statusClass(endpoint.health)}>{endpoint.health}</span>
                      </div>
                      <div className="note" style={{ marginTop: 8 }}>
                        req={endpoint.request_count} err={endpoint.error_count} p95~{endpoint.p95_latency_ms.toFixed(1)}ms
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="card" style={{ padding: 16, marginTop: 14 }}>
              <h2 className="section-title">Ops Timeline</h2>
              <p className="h2">Recent incident and rollup events</p>
              {timeline.length === 0 ? (
                <p className="note">No timeline events yet.</p>
              ) : (
                <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
                  {timeline.slice(0, 8).map((event, idx) => (
                    <div key={`${event.ts}-${idx}`} className="metric">
                      <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                        {new Date(event.ts).toLocaleString()} · {event.kind}
                      </div>
                      <div style={{ marginTop: 6 }}>{event.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </section>
      </main>

      <Footer />
    </>
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
