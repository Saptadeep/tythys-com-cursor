import { serviceModules } from './modules'
import type { BackendMode, RequestContext, ServiceSummary } from './types'

function getBackendMode(): BackendMode {
  return process.env.BACKEND_MODE === 'real' ? 'real' : 'mock'
}

export async function getServiceSummary(
  serviceId: string,
  ctx: RequestContext = {},
): Promise<ServiceSummary> {
  const mod = serviceModules[serviceId]
  if (!mod) {
    throw new Error(`Unsupported service: ${serviceId}`)
  }

  if (getBackendMode() === 'mock') {
    return mod.getMockSummary()
  }

  return mod.getRealSummary(ctx)
}
