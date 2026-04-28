'use client'
// src/components/sections/Hero.tsx
import { motion, cubicBezier }      from 'motion/react'
import { ArrowRight, ChevronDown } from 'lucide-react'

// Maps 1:1 to PILLARS in src/config/services.ts.
// Hero stats row is the first place a visitor sees the four-pillar spine.
const STATS = [
  { symbol: 'Σ',  label: 'Quantitative Reasoning' },
  { symbol: '∇',  label: 'Modeling'                },
  { symbol: '⚛',  label: 'Scientific Thinking'    },
  { symbol: '⟶',  label: 'Problem-Solving'        },
]

const fadeUp = (delay = 0) => ({
  initial:   { opacity: 0, y: 22 },
  animate:   { opacity: 1, y: 0  },
  // transition:{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
  transition:{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const},
})

export function Hero() {
  return (
    <section
      className="relative z-10 flex min-h-[100svh] flex-col justify-center overflow-hidden bg-grid"
      style={{ paddingTop: 'calc(28px + 56px + 2.5rem)' }}
    >
      {/* Radial glow */}
      <div className="pointer-events-none absolute left-[-8%] top-[15%] h-[70vw] w-[70vw] max-h-[580px] max-w-[580px] rounded-full"
           style={{ background: 'radial-gradient(ellipse, rgba(0,229,184,0.055) 0%, transparent 65%)' }} />
      <div className="pointer-events-none absolute right-[-5%] bottom-[10%] h-[40vw] w-[40vw] max-h-[400px] max-w-[400px] rounded-full"
           style={{ background: 'radial-gradient(ellipse, rgba(139,127,255,0.04) 0%, transparent 65%)' }} />

      <div className="relative mx-auto w-full max-w-[1300px] px-4 pb-10 sm:px-7 md:px-10 lg:px-16 xl:px-20">

        {/* Badge */}
        <motion.div {...fadeUp(0)} className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/7 px-4 py-1.5">
          <span className="relative flex h-[5px] w-[5px]">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-[5px] w-[5px] rounded-full bg-accent" />
          </span>
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-accent">
            Quantitative · Modeling · Scientific · Software
          </span>
        </motion.div>

        {/* H1 */}
        <motion.h1 {...fadeUp(0.1)}
          className="mb-5 font-display font-light leading-[1.03] tracking-[-0.03em] text-[#dde4f0]"
          style={{ fontSize: 'clamp(2rem, 9vw, 6.5rem)' }}
        >
          Hard problems,{' '}
          <br className="hidden xs:block" />
          <em className="italic text-accent">working</em>{' '}
          <span className="text-gold">tools</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p {...fadeUp(0.2)}
          className="mb-8 max-w-[560px] font-light leading-[1.75] text-dim"
          style={{ fontSize: 'clamp(0.88rem, 3vw, 1.05rem)' }}
        >
          Tythys turns <span className="text-[#dde4f0]">quantitative reasoning</span>,{' '}
          <span className="text-[#dde4f0]">modeling</span>, and{' '}
          <span className="text-[#dde4f0]">scientific thinking</span> into
          software you can actually use — focused tools, validated against
          real results, priced for the people who need them.
        </motion.p>

        {/* CTAs */}
        <motion.div {...fadeUp(0.3)} className="flex flex-col gap-3 xs:flex-row xs:flex-wrap">
          <a href="#products" className="btn-primary">
            Explore Tools <ArrowRight size={16} />
          </a>
          <a href="#pillars" className="btn-secondary">
            Our Approach
          </a>
        </motion.div>

        {/* Stats row */}
        {/* <motion.div {...fadeUp(0.45)} */}
        <motion.div {...fadeUp(0.45)}
          className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-accent-dim pt-8 xs:grid-cols-4 xs:gap-x-10"
        >
          {STATS.map(s => (
            <div key={s.symbol}>
              <div className="font-mono text-[clamp(1.25rem,4vw,1.65rem)] text-gold leading-none">
                {s.symbol}
              </div>
              <div className="mt-1 font-mono text-[0.66rem] uppercase tracking-[0.05em] text-dim">
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Scroll hint */}
        <motion.div {...fadeUp(0.6)}
          className="mt-8 hidden items-center gap-3 sm:flex"
        >
          <span className="h-px w-7 bg-gradient-to-r from-accent to-transparent" />
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-dim">
            Scroll to explore
          </span>
          <ChevronDown size={12} className="text-dim animate-bounce" />
        </motion.div>

      </div>
    </section>
  )
}
