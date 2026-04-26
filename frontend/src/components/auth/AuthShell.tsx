import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ParticleCanvas } from '@/components/ui/ParticleCanvas'
import { HUD } from '@/components/hud/HUD'

type AuthShellProps = {
  eyebrow: string
  title: string
  subtitle: string
  children: ReactNode
  secondaryCta?: {
    label: string
    href: string
  }
}

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  secondaryCta,
}: AuthShellProps) {
  return (
    <>
      <ParticleCanvas />
      <TopBar />
      <Navbar />
      <HUD />

      <main
        className="relative z-10 bg-grid"
        style={{
          paddingTop: 'calc(28px + 56px + 2rem)',
          background:
            'linear-gradient(180deg, transparent, rgba(0,229,184,0.022) 50%, transparent)',
        }}
      >
        <section className="relative z-10">
          <div className="mx-auto grid w-full max-w-[1300px] gap-5 px-4 py-14 sm:px-7 md:grid-cols-[1fr_1.1fr] md:px-10 lg:px-16 xl:px-20">
            <section
              className="rounded-2xl border border-accent-dim p-6 md:p-7"
              style={{
                background: 'rgba(10,20,42,0.88)',
                boxShadow:
                  '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
              }}
            >
              <span className="eyebrow">{eyebrow}</span>
              <h1
                className="mt-2 font-display font-light leading-[1.08] tracking-[-0.025em] text-[#dde4f0]"
                style={{ fontSize: 'clamp(1.55rem, 4vw, 2.4rem)' }}
              >
                {title}
              </h1>
              <p className="section-body mt-3 max-w-[48ch]">{subtitle}</p>

              {secondaryCta ? (
                <Link
                  href={secondaryCta.href}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/[0.06] px-4 py-2 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-accent transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/[0.12]"
                >
                  {secondaryCta.label}
                  <ArrowRight size={12} />
                </Link>
              ) : null}
            </section>

            <section
              className="relative overflow-hidden rounded-2xl border border-accent-dim p-6 md:p-7 scanlines"
              style={{
                background: 'rgba(10,20,42,0.88)',
                boxShadow:
                  '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
              }}
            >
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full"
                style={{
                  background:
                    'radial-gradient(circle, rgba(0,229,184,0.1) 0%, transparent 70%)',
                }}
              />
              <div className="relative z-10">{children}</div>
            </section>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
