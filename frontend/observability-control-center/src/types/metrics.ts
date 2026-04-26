export interface MetricsSummary {
  rps: number
  total_requests: number
  error_rate: number
  avg_latency: number
  p95_latency: number
}

export interface RouteMetric {
  path: string
  hits: number
  error_rate: number
  avg_latency: number
}

export interface ClientMetric {
  ip: string
  requests: number
}

export interface TimeSeriesMetric {
  rps: number[]
  latency: number[]
  errors: number[]
}

export interface MetricsResponse {
  summary: MetricsSummary
  routes: RouteMetric[]
  clients: ClientMetric[]
  timeseries: TimeSeriesMetric
}

export interface AppState {
  metrics: MetricsResponse | null
  loading: boolean
  error: string | null
}
