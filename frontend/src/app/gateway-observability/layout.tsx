import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GatewaySight — API Gateway Observability',
  description:
    'API gateway observability for reliable operations: monitor gateway health, trace request flow, and detect latency or error spikes early.',
  alternates: { canonical: '/gateway-observability' },
  openGraph: {
    title: 'GatewaySight — API Gateway Observability',
    description: 'Monitor gateway health and detect latency or error spikes early.',
    url: '/gateway-observability',
    type: 'website',
  },
}

export default function GatewayObservabilityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
