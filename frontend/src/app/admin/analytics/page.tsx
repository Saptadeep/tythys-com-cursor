import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { TopBar } from '@/components/layout/Topbar'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ParticleCanvas } from '@/components/ui/ParticleCanvas'
import { HUD } from '@/components/hud/HUD'

export const metadata: Metadata = {
  title: 'Admin Analytics',
  description: 'Private analytics dashboard for Tythys admins.',
  robots: { index: false, follow: false, nocache: true },
}

const VERCEL_PROJECT = process.env.VERCEL_PROJECT_NAME ?? 'tythys'
const VERCEL_TEAM = process.env.VERCEL_TEAM_SLUG ?? ''
const VERCEL_ANALYTICS_URL = VERCEL_TEAM
  ? `https://vercel.com/${VERCEL_TEAM}/${VERCEL_PROJECT}/analytics`
  : `https://vercel.com/dashboard/analytics`

export default async function AdminAnalyticsPage() {
  const session = await auth()
  const adminEmail = session?.user?.email ?? 'admin'

  const cards = [
    {
      label: 'Vercel Web Analytics',
      description:
        'Aggregated, privacy-friendly traffic metrics powered by @vercel/analytics. Use the dashboard for full session/route breakdown.',
      cta: { href: VERCEL_ANALYTICS_URL, text: 'Open Vercel dashboard' },
    },
    {
      label: 'Speed Insights',
      description:
        'Real-user performance metrics (LCP, INP, CLS) per route. Available on the same Vercel project page.',
      cta: { href: VERCEL_ANALYTICS_URL, text: 'View Speed Insights' },
    },
    {
      label: 'Contact submissions',
      description:
        'Live submissions stream to email + (optional) webhook log. Configure CONTACT_FALLBACK_WEBHOOK_URL to fan-out to your store of choice.',
      cta: { href: '#', text: 'Connect a webhook in env' },
    },
  ]

  return (
    <>
      <ParticleCanvas />
      <TopBar />
      <Navbar />
      <HUD />

      <main className="relative z-10" style={{ paddingTop: 'calc(28px + 56px + 1.5rem)' }}>
        <section className="relative z-10">
          <div className="mx-auto max-w-[1300px] px-4 py-12 sm:px-7 sm:py-16 md:px-10 lg:px-16 lg:py-20 xl:px-20">
            <span className="eyebrow mb-3">Admin</span>
            <h1 className="section-title mb-3">
              Analytics <em className="title-accent">control room</em>
            </h1>
            <p className="section-body mb-8 max-w-[760px]">
              Signed in as <span className="text-accent">{adminEmail}</span>. This page is restricted to allowlisted admins and
              is excluded from sitemap and search indexing.
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {cards.map((c) => (
                <article
                  key={c.label}
                  className="rounded-2xl border border-accent-dim p-6"
                  style={{ background: 'rgba(10,20,42,0.88)' }}
                >
                  <p className="mb-1 font-mono text-xs uppercase tracking-[0.14em] text-accent">{c.label}</p>
                  <p className="mt-2 text-sm text-dim">{c.description}</p>
                  <a
                    href={c.cta.href}
                    target={c.cta.href.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="btn-ghost mt-4 inline-flex"
                  >
                    {c.cta.text}
                  </a>
                </article>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-accent-dim p-6" style={{ background: 'rgba(10,20,42,0.6)' }}>
              <p className="mb-2 font-mono text-xs uppercase tracking-[0.14em] text-gold">Operational notes</p>
              <ul className="space-y-2 text-sm text-dim">
                <li>- Auth is Google OAuth via Auth.js v5; admins are restricted to the ADMIN_EMAILS allowlist.</li>
                <li>- All public API routes pass through origin checks, rate limits, and Turnstile (when applicable).</li>
                <li>- Security headers (HSTS, CSP, X-Frame-Options) are applied at the edge in next.config.js.</li>
                <li>- /admin/* and /auth/* are excluded from robots, sitemap, and indexing.</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
