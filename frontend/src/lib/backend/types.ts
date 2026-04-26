export type BackendMode = 'mock' | 'real'

export interface RequestContext {
  userId?: string
  authToken?: string
}

export interface ServiceSummary {
  serviceId: string
  health: 'healthy' | 'degraded' | 'down'
  latencyMs: number
  uptimePct: number
  requestsPerMin?: number
  errorRatePct?: number
  notes?: string
}

export interface ServiceModule {
  id: string
  getMockSummary: () => ServiceSummary
  getRealSummary: (ctx: RequestContext) => Promise<ServiceSummary>
}
