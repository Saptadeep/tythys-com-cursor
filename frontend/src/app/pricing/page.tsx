'use client'

import Link from 'next/link'
import { TopBar } from '@/components/layout/Topbar'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ParticleCanvas } from '@/components/ui/ParticleCanvas'
import { HUD } from '@/components/hud/HUD'

const TIERS = [
  {
    name: 'Free',
    price: '$0',
    cadence: 'forever',
    highlight: 'Soft-launch default',
    features: [
      'Unlimited single-load solves',
      'SI + imperial units',
      'Section presets + custom I/c',
      'PDF export with watermark',
    ],
  },
  {
    name: 'Pro',
    price: '$9',
    cadence: 'per month',
    highlight: 'Week-6 waitlist',
    features: [
      'Combined load cases (superposition)',
      'Clean PDF reports (no watermark)',
      'Saved solve history',
      'Priority feedback channel',
    ],
  },
  {
    name: 'API',
    price: '$49',
    cadence: 'per month',
    highlight: 'Early access',
    features: [
      'Programmatic /v1/beam-calc/solve access',
      'Higher rate limits',
      'Usage analytics + API keys',
      'Team support path',
    ],
  },
]

export default function PricingPage() {
  return (
    <>
      <ParticleCanvas />
      <TopBar />
      <Navbar />
      <HUD />

      <main className="relative z-10" style={{ paddingTop: 'calc(28px + 56px + 1.5rem)' }}>
        <section className="relative z-10">
          <div className="mx-auto max-w-[1300px] px-4 py-12 sm:px-7 sm:py-16 md:px-10 lg:px-16 lg:py-20 xl:px-20">
            <span className="eyebrow mb-3">EngineerCalc pricing</span>
            <h1 className="section-title mb-3">
              Start free, upgrade when your workflow <em className="title-accent">needs automation</em>
            </h1>
            <p className="section-body mb-8 max-w-[760px]">
              Week 6 runs as a soft launch: free remains open for validated single-case solves, while Pro and API
              are opened through a waitlist as we harden deployment and collect real user feedback.
            </p>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {TIERS.map((tier) => (
                <article
                  key={tier.name}
                  className="rounded-2xl border border-accent-dim p-6"
                  style={{ background: 'rgba(10,20,42,0.88)' }}
                >
                  <p className="mb-1 font-mono text-xs uppercase tracking-[0.14em] text-accent">{tier.highlight}</p>
                  <h2 className="text-xl font-semibold text-primary">{tier.name}</h2>
                  <p className="mt-2 text-2xl font-semibold text-primary">
                    {tier.price}
                    <span className="ml-1 text-sm font-normal text-dim">/{tier.cadence}</span>
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-dim">
                    {tier.features.map((feature) => (
                      <li key={feature}>- {feature}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/beam-calculator" className="btn-primary">
                Open Beam Calculator
              </Link>
              <a href="/#contact" className="btn-ghost">
                Join Pro/API waitlist
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
