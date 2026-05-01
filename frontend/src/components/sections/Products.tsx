'use client'
// src/components/sections/Products.tsx
import { useRef }        from 'react'
import { motion, useInView } from 'motion/react'
import { ArrowRight, ExternalLink } from 'lucide-react'
import Link              from 'next/link'
import { SERVICES, STATUS_CONFIG, PILLARS } from '@/config/services'
import { cn }            from '@/lib/cn'
import type { Service }  from '@/types'
import { LandingSectionLink } from '@/components/layout/LandingSectionLink'

// Quick lookup so each card can render its pillar chips with the right
// symbol + colour without recomputing on every render.
const PILLAR_BY_ID = Object.fromEntries(PILLARS.map(p => [p.id, p])) as Record<
  (typeof PILLARS)[number]['id'],
  (typeof PILLARS)[number]
>

function ProductCard({ service, index }: { service: Service; index: number }) {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const sc     = STATUS_CONFIG[service.status]
  const badgeLabel = service.id === 'custom-models' ? '' : sc.label

  const hasLink = service.href && service.href !== '#contact' && service.status === 'live'

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className={cn(
          'group relative flex h-full flex-col overflow-hidden rounded-2xl',
          'border border-accent-dim bg-card backdrop-blur-xl',
          'transition-all duration-300',
          'hover:border-accent/35 hover:-translate-y-1',
          'hover:shadow-[0_20px_56px_rgba(0,0,0,0.5)]',
        )}
        style={{
          background: 'rgba(10,20,42,0.88)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        {/* Shimmer on hover */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
             style={{ background: `linear-gradient(135deg, ${service.accentColor}06 0%, transparent 55%)` }} />

        {/* Accent top line */}
        <div className="h-[2px] w-full flex-shrink-0 rounded-t-2xl"
             style={{ background: `linear-gradient(90deg, ${service.accentColor}40, ${service.accentColor}0a)` }} />

        <div className="flex flex-1 flex-col p-5 md:p-6">
          {/* Top row: icon + badge */}
          <div className="mb-4 flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl text-xl flex-shrink-0"
                 style={{ background: `${service.accentColor}1a` }}>
              {service.icon}
            </div>
            {badgeLabel && badgeLabel !== 'Coming Soon' ? (
              <span className={cn('status-badge', sc.color, sc.bg, sc.border)}>
                {badgeLabel}
              </span>
            ) : null}
          </div>

          {/* Category */}
          <p className="mb-1 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-dim">
            {service.category}
          </p>

          {/* Name */}
          <h3 className="mb-1.5 font-display font-semibold leading-tight text-[#dde4f0]"
              style={{ fontSize: 'clamp(1.05rem, 2.5vw, 1.28rem)' }}>
            {service.name}
          </h3>

          {/* Tagline */}
          <p className="mb-2.5 text-[0.8rem] font-medium" style={{ color: service.accentColor }}>
            {service.tagline}
          </p>

          {/* Description */}
          <p className="mb-4 flex-1 text-[0.83rem] font-light leading-[1.62] text-dim">
            {service.description}
          </p>

          {/* Math domains */}
          {service.mathDomain && service.mathDomain.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {service.mathDomain.map(d => (
                <span key={d}
                      className="rounded-sm border border-accent/10 bg-accent/5 px-2 py-0.5 font-mono text-[0.55rem] tracking-wide text-accent/70">
                  {d}
                </span>
              ))}
            </div>
          )}

          {/* Pillar chips — which Tythys pillars this tool exercises */}
          {service.pillars && service.pillars.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-1.5">
              <span className="font-mono text-[0.54rem] uppercase tracking-[0.14em] text-dim/60">
                Pillars
              </span>
              {service.pillars.map(pid => {
                const p = PILLAR_BY_ID[pid]
                if (!p) return null
                return (
                  <span
                    key={pid}
                    title={p.label}
                    className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[0.55rem] tracking-wide"
                    style={{
                      borderColor: `${p.accentColor}33`,
                      background:  `${p.accentColor}10`,
                      color:       p.accentColor,
                    }}
                  >
                    <span className="text-[0.7rem] leading-none">{p.symbol}</span>
                    <span className="hidden xs:inline">{p.label.split(' ')[0]}</span>
                  </span>
                )
              })}
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between border-t border-accent-dim pt-3.5">
            <span className="font-mono text-[0.76rem] text-gold">
              {service.price === 'Contact for pricing' || service.price === 'School licensing' ? (
                <LandingSectionLink sectionId="contact" className="underline-offset-2 hover:underline">
                  {service.price}
                </LandingSectionLink>
              ) : (
                service.price
              )}
              {service.apiEndpoint && service.id !== 'custom-models' && (
                <span className="ml-2 rounded-full border border-accent/20 bg-accent/8 px-2 py-0.5 text-[0.55rem] text-accent">
                  ⚡ Live
                </span>
              )}
            </span>
            {hasLink ? (
              <Link href={service.href!}
                    className="flex min-h-[40px] items-center gap-1.5 text-[0.76rem] font-medium text-accent transition-all duration-200 hover:gap-3">
                Open <ExternalLink size={11} />
              </Link>
            ) : (
              <LandingSectionLink
                sectionId="contact"
                className="flex min-h-[40px] items-center gap-1.5 text-[0.76rem] font-medium text-accent transition-all duration-200 hover:gap-3"
              >
                Learn more <ArrowRight size={11} />
              </LandingSectionLink>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function Products() {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="products" className="relative z-10 bg-black/[0.06]">
      <div className="mx-auto max-w-[1300px] px-4 py-14 sm:px-7 sm:py-20 md:px-10 lg:px-16 lg:py-24 xl:px-20">

        {/* Section header */}
        <div ref={ref}>
          <motion.span
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="eyebrow mb-3"
          >
            Platform
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="section-title mb-3"
          >
            Focused tools for{' '}
            <br className="hidden sm:block" />
            <em className="title-accent">real problems</em>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="section-body mb-10 max-w-[520px]"
          >
            Each tool below is one of the four pillars made tangible &mdash;
            quantitative reasoning, modeling, scientific thinking, or
            problem-solving compressed into something you can run, validate,
            and rely on.
          </motion.p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, i) => (
            <ProductCard key={service.id} service={service} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
