'use client'
// src/components/sections/About.tsx
import { useRef }            from 'react'
import { motion, useInView } from 'motion/react'
import { EQUATIONS, SKILL_TAGS } from '@/config/services'

export function About() {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="about" className="relative z-10"
      style={{ background: 'linear-gradient(180deg, transparent, rgba(0,229,184,0.022) 50%, transparent)' }}>
      <div className="mx-auto max-w-[1300px] px-4 py-14 sm:px-7 sm:py-20 md:px-10 lg:px-16 lg:py-24 xl:px-20">

        <div ref={ref} className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-20 lg:items-center">

          {/* Left: text */}
          <div>
            <motion.span
              initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
              className="eyebrow mb-3"
            >
              About Tythys
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.05, duration: 0.6 }}
              className="section-title mb-4"
            >
              A solo project.<br />
              <em className="title-accent">Honest about that.</em>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="section-body mb-4 max-w-full"
            >
              Tythys is one person learning by building &mdash; treating the math
              and physics behind each tool as the curriculum, and the tool itself
              as the exam. Quantitative reasoning, modeling, and scientific thinking
              get internalised the same way they were always meant to: by being put
              to work on something real.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="section-body mb-6 max-w-full"
            >
              Every product is scoped to what can be implemented correctly today,
              validated against known results, and shipped only when it holds up.
              The gap between $50K enterprise software and a spreadsheet is real;
              that&apos;s the space Tythys is building into, one tool at a time.
            </motion.p>

            {/* Skill tags */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.22, duration: 0.6 }}
              className="flex flex-wrap gap-2"
            >
              {SKILL_TAGS.map(tag => (
                <span key={tag}
                      className="rounded border border-accent/12 bg-accent/5 px-2.5 py-1 font-mono text-[0.62rem] tracking-[0.04em] text-dim">
                  {tag}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right: equation panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="relative overflow-hidden rounded-2xl border border-accent-dim scanlines"
            style={{ background: 'rgba(10,20,42,0.88)' }}
          >
            {/* Scanlines are applied via CSS pseudo-element */}
            <div className="relative z-10 p-6 md:p-8">
              {EQUATIONS.map((eq, i) => (
                <div key={eq.label}
                     className={`py-4 ${i < EQUATIONS.length - 1 ? 'border-b border-accent-dim' : ''}`}>
                  <p className="mb-1 font-mono leading-relaxed text-accent/65 break-words"
                     style={{ fontSize: 'clamp(0.62rem, 1.8vw, 0.85rem)' }}>
                    {eq.formula}
                  </p>
                  <p className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-gold/70">
                    {eq.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Corner glow */}
            <div className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full"
                 style={{ background: 'radial-gradient(circle, rgba(0,229,184,0.08) 0%, transparent 70%)' }} />
          </motion.div>

        </div>
      </div>
    </section>
  )
}
