import type { Metadata } from 'next'
import { BeamCalcJsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'EngineerCalc — Beam Calculator',
  description:
    'Live, validated beam deflection calculator. Solve simply-supported beams for point load, UDL, offset load, and end moment. Validated against Roark\'s Formulas for Stress and Strain.',
  alternates: { canonical: '/beam-calculator' },
  openGraph: {
    title: 'EngineerCalc — Beam Calculator',
    description: 'Validated simply-supported beam calculator with live charts and PDF export.',
    url: '/beam-calculator',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EngineerCalc — Beam Calculator',
    description: 'Validated simply-supported beam calculator with live charts and PDF export.',
  },
}

export default function BeamCalculatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BeamCalcJsonLd />
      {children}
    </>
  )
}
