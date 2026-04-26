import type { RequestContext, ServiceModule, ServiceSummary } from './types'

function toNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

async function fetchRealSummary(serviceId: string, ctx: RequestContext): Promise<ServiceSummary> {
  const baseUrl = process.env.BACKEND_BASE_URL
  if (!baseUrl) {
    throw new Error('Missing BACKEND_BASE_URL for real backend mode.')
  }

  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/services/${serviceId}/summary`, {
    headers: {
      ...(ctx.authToken ? { Authorization: `Bearer ${ctx.authToken}` } : {}),
      ...(ctx.userId ? { 'X-User-Id': ctx.userId } : {}),
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`Real backend request failed for ${serviceId}: ${res.status}`)
  }

  const json = (await res.json()) as Partial<ServiceSummary>
  return {
    serviceId,
    health: (json.health as ServiceSummary['health']) ?? 'degraded',
    latencyMs: toNumber(json.latencyMs, 75),
    uptimePct: toNumber(json.uptimePct, 99.1),
    requestsPerMin: toNumber(json.requestsPerMin, 0),
    errorRatePct: toNumber(json.errorRatePct, 0),
    notes: typeof json.notes === 'string' ? json.notes : undefined,
  }
}

export const serviceModules: Record<string, ServiceModule> = {
  'api-gateway-observability': {
    id: 'api-gateway-observability',
    getMockSummary: () => ({
      serviceId: 'api-gateway-observability',
      health: 'healthy',
      latencyMs: 22,
      uptimePct: 99.96,
      requestsPerMin: 1460,
      errorRatePct: 0.12,
      notes: 'Gateway traces and metrics are nominal.',
    }),
    getRealSummary: (ctx: RequestContext) => fetchRealSummary('api-gateway-observability', ctx),
  },
  'beam-calc': {
    id: 'beam-calc',
    getMockSummary: () => ({
      serviceId: 'beam-calc',
      health: 'healthy',
      latencyMs: 41,
      uptimePct: 99.72,
      requestsPerMin: 84,
      errorRatePct: 0.31,
      notes: 'Computation workers available.',
    }),
    getRealSummary: (ctx: RequestContext) => fetchRealSummary('beam-calc', ctx),
  },
}
