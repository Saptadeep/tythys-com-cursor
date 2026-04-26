'use client'
// src/components/sections/Hero.tsx
import { motion }      from 'motion/react'
import { ArrowRight, ChevronDown } from 'lucide-react'

const STATS = [
  { symbol: '∇',  label: 'Physics-Based'  },
  { symbol: 'λ²', label: 'Linear Algebra' },
  { symbol: '∫∞', label: 'Calculus-Driven'},
  { symbol: 'Σ',  label: 'Precise Compute'},
]

const fadeUp = (delay = 0) => ({
  initial:   { opacity: 0, y: 22 },
  animate:   { opacity: 1, y: 0  },
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
            Simulation · Computation · Data
          </span>
        </motion.div>

        {/* TythysOne hero wordmark */}
        <motion.div {...fadeUp(0.1)} className="mb-5">
          <h1
            className="leading-[0.95] tracking-[-0.03em] italic"
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontWeight: 900,
              fontSize: 'clamp(3.2rem, 11vw, 9rem)',
            }}
          >
            <span className="text-white">Tythys</span>
            <span style={{ color: '#00e5b8' }}>One</span>
          </h1>
          <p
            className="mt-4 font-mono uppercase text-dim"
            style={{ fontSize: 'clamp(0.6rem, 1.4vw, 0.72rem)', letterSpacing: '0.38em' }}
          >
            Engineering Computation Platform
          </p>
        </motion.div>

        {/* Subtitle */}
        <motion.p {...fadeUp(0.2)}
          className="mb-8 max-w-[520px] font-light leading-[1.75] text-dim"
          style={{ fontSize: 'clamp(0.88rem, 3vw, 1.05rem)' }}
        >
          A growing collection of focused tools — simulation, computation,
          and data analysis — built carefully, validated against real results,
          and priced for the teams that actually need them.
        </motion.p>

        {/* CTAs */}
        <motion.div {...fadeUp(0.3)} className="flex flex-col gap-3 xs:flex-row xs:flex-wrap">
          <a href="#products" className="btn-primary">
            Explore Tools <ArrowRight size={16} />
          </a>
          <a href="#about" className="btn-secondary">
            About Tythys
          </a>
        </motion.div>

        {/* Stats row */}
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
