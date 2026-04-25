export type ServiceSummary = {
  serviceId: string
  health: "healthy" | "degraded" | "down"
  latencyMs: number
  uptimePct: number
  requestsPerMin: number
  errorRatePct: number
  notes?: string
}

export type IngestionLatest = {
  service_id: string | null
  total_events: number
  last_event_at: string | null
  recent_event_count: number
  error_events_last_window: number
}

function getBackendMode() {
  return process.env.BACKEND_MODE === "real" ? "real" : "mock"
}

function getMockSummary(serviceId: string): ServiceSummary {
  if (serviceId === "api-gateway-observability") {
    return {
      serviceId,
      health: "healthy",
      latencyMs: 19,
      uptimePct: 99.96,
      requestsPerMin: 1430,
      errorRatePct: 0.12,
      notes: "Gateway traces and metrics are nominal.",
    }
  }
  return {
    serviceId,
    health: "degraded",
    latencyMs: 62,
    uptimePct: 99.34,
    requestsPerMin: 201,
    errorRatePct: 0.81,
    notes: "Using default mock profile.",
  }
}

export async function getServiceSummary(serviceId: string): Promise<ServiceSummary> {
  if (getBackendMode() === "mock") return getMockSummary(serviceId)

  const baseUrl = process.env.BACKEND_BASE_URL
  if (!baseUrl) throw new Error("Missing BACKEND_BASE_URL in real mode.")

  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/services/${serviceId}/summary`, {
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`Backend fetch failed (${res.status}).`)
  return (await res.json()) as ServiceSummary
}

function getMockIngestionLatest(): IngestionLatest {
  return {
    service_id: "api-gateway-observability",
    total_events: 2840,
    last_event_at: new Date().toISOString(),
    recent_event_count: 20,
    error_events_last_window: 1,
  }
}

export async function getIngestionLatest(): Promise<IngestionLatest> {
  if (getBackendMode() === "mock") return getMockIngestionLatest()

  const baseUrl = process.env.BACKEND_BASE_URL
  if (!baseUrl) throw new Error("Missing BACKEND_BASE_URL in real mode.")

  const apiKey = process.env.INGEST_API_KEY
  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/ingest/events/latest`, {
    cache: "no-store",
    headers: apiKey ? { "x-api-key": apiKey } : {},
  })
  if (!res.ok) throw new Error(`Ingestion fetch failed (${res.status}).`)
  return (await res.json()) as IngestionLatest
}

export type IncidentDTO = {
  id: string
  service_id: string
  title: string
  state: string
  severity: string
  route?: string | null
  opened_at: string
  updated_at: string
  estimated_loss_per_hour_usd: number
  affected_traffic_pct: number
}

export type EndpointHealthDTO = {
  service_id: string
  route: string
  window_start: string
  window_end: string
  request_count: number
  error_count: number
  p95_latency_ms: number
  health: "healthy" | "degraded" | "down"
}

export type ActionDTO = {
  rank: number
  title: string
  rationale: string
  incident_id?: string | null
}

export type TimelineEventDTO = {
  ts: string
  kind: "rollup" | "incident" | "ingest"
  message: string
}

async function proxyGet<T>(path: string): Promise<T> {
  const baseUrl = process.env.INTERNAL_APP_ORIGIN ?? "http://127.0.0.1:3000"
  const res = await fetch(`${baseUrl}${path}`, { cache: "no-store" })
  if (!res.ok) throw new Error(`Proxy fetch failed (${res.status}) for ${path}`)
  const json = (await res.json()) as { ok?: boolean; data?: T; error?: string }
  if (json && typeof json === "object" && "ok" in json && json.ok === false) {
    throw new Error(json.error ?? "Unknown error")
  }
  if (!json || typeof json !== "object" || json.data === undefined) {
    throw new Error("Invalid proxy response shape.")
  }
  return json.data
}

export async function getIncidentsCurrent(): Promise<IncidentDTO[]> {
  if (getBackendMode() === "mock") return []
  return proxyGet<IncidentDTO[]>("/api/incidents/current")
}

export async function getEndpointsHealth(): Promise<EndpointHealthDTO[]> {
  if (getBackendMode() === "mock") return []
  return proxyGet<EndpointHealthDTO[]>("/api/endpoints/health")
}

export async function getActionsPrioritized(): Promise<ActionDTO[]> {
  if (getBackendMode() === "mock") return []
  return proxyGet<ActionDTO[]>("/api/actions/prioritized")
}

export async function getTimeline(): Promise<TimelineEventDTO[]> {
  if (getBackendMode() === "mock") return []
  return proxyGet<TimelineEventDTO[]>("/api/timeline")
}
