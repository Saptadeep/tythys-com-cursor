'use client'
// src/components/sections/Pillars.tsx
// ─────────────────────────────────────────────────────────────
//  The four-pillar spine of Tythys.
//  This section makes the operating philosophy explicit and
//  bridges the Hero to the Products grid: every product below
//  is an instance of one (or more) of these pillars.
// ─────────────────────────────────────────────────────────────
import { useRef }            from 'react'
import { motion, useInView } from 'motion/react'
import { PILLARS }           from '@/config/services'
import { cn }                from '@/lib/cn'

export function Pillars() {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="pillars" className="relative z-10">
      <div className="mx-auto max-w-[1300px] px-4 py-14 sm:px-7 sm:py-20 md:px-10 lg:px-16 lg:py-24 xl:px-20">

        {/* Section header */}
        <div ref={ref} className="mb-10 lg:mb-14">
          <motion.span
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="eyebrow mb-3"
          >
            The Four Pillars
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="section-title mb-3"
          >
            What Tythys is built on{' '}
            <br className="hidden sm:block" />
            <em className="title-accent">— and tested against</em>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="section-body max-w-[560px]"
          >
            Every product on this site exercises at least one of these. Every
            decision &mdash; what to build, what to ship, what to refuse &mdash; gets
            measured against them.
          </motion.p>
        </div>

        {/* Pillar grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 22 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.15 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                'group relative flex h-full flex-col overflow-hidden rounded-2xl',
                'border border-accent-dim bg-card backdrop-blur-xl',
                'p-5 md:p-6',
                'transition-all duration-300',
                'hover:-translate-y-1 hover:shadow-[0_20px_56px_rgba(0,0,0,0.5)]',
              )}
              style={{
                background: 'rgba(10,20,42,0.88)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
              }}
            >
              {/* Hover wash in pillar colour */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                   style={{ background: `linear-gradient(135deg, ${p.accentColor}10 0%, transparent 60%)` }} />

              {/* Top accent bar */}
              <div className="absolute left-0 right-0 top-0 h-[2px] rounded-t-2xl"
                   style={{ background: `linear-gradient(90deg, ${p.accentColor}55, ${p.accentColor}10)` }} />

              {/* Symbol + index */}
              <div className="mb-5 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl font-mono text-2xl leading-none"
                     style={{
                       background: `${p.accentColor}1a`,
                       color: p.accentColor,
                     }}>
                  {p.symbol}
                </div>
                <span className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-dim/70">
                  P0{i + 1}
                </span>
              </div>

              {/* Label */}
              <h3 className="mb-1.5 font-display font-semibold leading-tight text-[#dde4f0]"
                  style={{ fontSize: 'clamp(1rem, 2.2vw, 1.18rem)' }}>
                {p.label}
              </h3>

              {/* Short tagline in pillar colour */}
              <p className="mb-3 text-[0.78rem] font-medium" style={{ color: p.accentColor }}>
                {p.short}
              </p>

              {/* Long description */}
              <p className="text-[0.82rem] font-light leading-[1.62] text-dim">
                {p.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Equation strip — visual reinforcement */}
        <motion.div
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-accent-dim pt-6"
        >
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-dim">
            Operating loop
          </span>
          <span className="font-mono text-[0.78rem] tracking-wide text-accent/80">
            reason &nbsp;<span className="text-dim">→</span>&nbsp; model &nbsp;<span className="text-dim">→</span>&nbsp; test &nbsp;<span className="text-dim">→</span>&nbsp; ship
          </span>
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-gold/70">
            repeat
          </span>
        </motion.div>
      </div>
    </section>
  )
}
