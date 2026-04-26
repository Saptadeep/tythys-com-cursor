'use client'
// src/components/sections/Process.tsx
import { useRef }            from 'react'
import { motion, useInView } from 'motion/react'
import { PROCESS_STEPS }     from '@/config/services'

export function Process() {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="process" className="relative z-10">
      <div className="mx-auto max-w-[1300px] px-4 py-14 sm:px-7 sm:py-20 md:px-10 lg:px-16 lg:py-24 xl:px-20">

        <div ref={ref}>
          <motion.span
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            className="eyebrow mb-3"
          >
            How It Gets Built
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.05, duration: 0.6 }}
            className="section-title mb-3"
          >
            The <em className="title-accent">approach</em>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="section-body mb-10 max-w-[480px]"
          >
            Each tool follows the same discipline — understand the problem first,
            implement it correctly, then ship something clean.
          </motion.p>
        </div>

        {/* Steps grid */}
        <div className="overflow-hidden rounded-2xl border border-accent-dim">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((step, i) => {
              const isLast = i === PROCESS_STEPS.length - 1
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.15 + i * 0.08, duration: 0.55 }}
                  className="group relative p-6 transition-colors duration-250 hover:bg-accent/[0.03]
                             border-b border-accent-dim last:border-b-0
                             sm:[&:nth-child(2n)]:border-r-0 sm:border-r sm:border-b-0
                             sm:[&:nth-child(1)]:border-b sm:even:border-b-0
                             lg:border-b-0 lg:border-r lg:[&:last-child]:border-r-0"
                >
                  {/* Step number — large ghost */}
                  <div className="mb-4 font-mono font-medium leading-none text-accent/[0.08]"
                       style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.4rem)' }}>
                    {step.number}
                  </div>
                  <h3 className="mb-2 font-display font-semibold leading-tight text-[#dde4f0]"
                      style={{ fontSize: 'clamp(0.92rem, 2vw, 1.05rem)' }}>
                    {step.title}
                  </h3>
                  <p className="text-[0.82rem] font-light leading-[1.65] text-dim">
                    {step.description}
                  </p>

                  {/* Connector arrow — visible on lg only */}
                  {!isLast && (
                    <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-1/2 text-accent/20 lg:block">
                      →
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
