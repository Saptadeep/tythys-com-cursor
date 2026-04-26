import type { MetricsResponse, RouteMetric } from '../types/metrics'

const DEFAULT_POINTS = 60
const MOCK_ENDPOINT_DELAY_MS = 320
const API_BASE = process.env.NEXT_PUBLIC_METRICS_API_BASE?.trim()

const seedRoutes = [
  '/api/v1/metrics',
  '/api/v1/events',
  '/api/v1/sessions',
  '/api/v1/users',
  '/api/v1/alerts',
  '/api/v1/billing',
]

const random = (min: number, max: number) => Math.random() * (max - min) + min

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value))

const randomRoute = (): RouteMetric => {
  const hits = Math.floor(random(50, 3200))
  const errorRate = clamp(random(0.2, 8.2), 0, 100)
  return {
    path: seedRoutes[Math.floor(Math.random() * seedRoutes.length)],
    hits,
    error_rate: Number(errorRate.toFixed(2)),
    avg_latency: Number(random(85, 450).toFixed(2)),
  }
}

const generateTimeSeries = (last?: MetricsResponse): MetricsResponse['timeseries'] => {
  if (!last) {
    return {
      rps: Array.from({ length: DEFAULT_POINTS }, () => Number(random(80, 280).toFixed(2))),
      latency: Array.from({ length: DEFAULT_POINTS }, () =>
        Number(random(90, 380).toFixed(2)),
      ),
      errors: Array.from({ length: DEFAULT_POINTS }, () => Number(random(0, 8).toFixed(2))),
    }
  }

  return {
    rps: [...last.timeseries.rps.slice(-59), Number(random(80, 320).toFixed(2))],
    latency: [...last.timeseries.latency.slice(-59), Number(random(95, 420).toFixed(2))],
    errors: [...last.timeseries.errors.slice(-59), Number(random(0, 9.5).toFixed(2))],
  }
}

export const fetchMetrics = async (last?: MetricsResponse): Promise<MetricsResponse> => {
  if (API_BASE) {
    const response = await fetch(`${API_BASE}/metrics`)
    if (!response.ok) {
      throw new Error(`Metrics request failed with status ${response.status}`)
    }
    return (await response.json()) as MetricsResponse
  }

  await new Promise((resolve) => setTimeout(resolve, MOCK_ENDPOINT_DELAY_MS))

  const routes = Array.from({ length: 8 }, randomRoute)
  const timeseries = generateTimeSeries(last)
  const rpsNow = timeseries.rps.at(-1) ?? 0
  const avgLatencyNow = timeseries.latency.at(-1) ?? 0
  const errorNow = timeseries.errors.at(-1) ?? 0

  return {
    summary: {
      rps: Number(rpsNow.toFixed(2)),
      total_requests: routes.reduce((acc, route) => acc + route.hits, 0),
      error_rate: Number(errorNow.toFixed(2)),
      avg_latency: Number(avgLatencyNow.toFixed(2)),
      p95_latency: Number((avgLatencyNow * 1.26).toFixed(2)),
    },
    routes,
    clients: Array.from({ length: 5 }, (_, index) => ({
      ip: `192.168.0.${index + 12}`,
      requests: Math.floor(random(20, 2200)),
    })),
    timeseries,
  }
}
