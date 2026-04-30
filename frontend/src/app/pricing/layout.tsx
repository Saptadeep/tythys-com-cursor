import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'EngineerCalc pricing for soft launch — Free, Pro, and API tiers. Start free, upgrade when your workflow needs automation.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Tythys Pricing',
    description: 'Free, Pro, and API tiers for EngineerCalc and future Tythys tools.',
    url: '/pricing',
    type: 'website',
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
