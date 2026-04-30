'use client'
// src/components/layout/Navbar.tsx
import { useState, useEffect }  from 'react'
import Link                     from 'next/link'
import { usePathname }          from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { Menu, X, Zap }         from 'lucide-react'
import { cn }                   from '@/lib/cn'
import { SERVICES }             from '@/config/services'
import { BrandGlyph }           from './BrandGlyph'
import { NavUserMenu }          from './NavUserMenu'

/* Map known sub-pages → contextual subline shown under the wordmark.
   Falls back to "Control Plane" on the marketing/landing route. */
const SUBLINE_BY_PATH: Array<{ test: (p: string) => boolean; label: string }> = [
  { test: (p) => p.startsWith('/gateway-observability'), label: 'GatewaySight · Control Plane' },
]

const NAV_LINKS = [
  { label: 'Pillars',  href: '#pillars'  },
  { label: 'Products', href: '#products' },
  { label: 'Pricing',  href: '/pricing'  },
  { label: 'Approach', href: '#process'  },
  { label: 'About',    href: '#about'    },
]

const LIVE_COUNT = SERVICES.filter(s => s.status === 'live').length

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname() ?? '/'
  const subline = SUBLINE_BY_PATH.find(({ test }) => test(pathname))?.label ?? 'Control Plane'

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      <header
        className={cn(
          'fixed left-0 right-0 z-[100] transition-all duration-300',
          'top-[28px]',    // sits below the 28px TopBar
          scrolled
            ? 'bg-[rgba(4,8,15,0.97)] shadow-[0_4px_32px_rgba(0,0,0,0.45)]'
            : 'bg-[rgba(4,8,15,0.82)]',
          'backdrop-blur-[20px] border-b border-accent-dim',
        )}
      >
        <nav className="mx-auto flex h-14 max-w-[1300px] items-center justify-between px-4 sm:px-7 md:px-10 lg:px-16 xl:px-20">

          {/* Logo */}
          <Link
            href="/"
            aria-label="TythysOne — back to overview"
            className="group flex items-center gap-2.5 text-[#dde4f0]"
          >
            <span className="inline-flex rounded-[7px] transition-shadow duration-300 group-hover:shadow-glow">
              <BrandGlyph size={28} />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="font-display text-[1.1rem] font-bold tracking-[-0.005em] transition-colors duration-200 group-hover:text-accent">
                Tythys<span className="text-accent transition-colors duration-200 group-hover:text-[#dde4f0]">One</span>
              </span>
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-dim/70 transition-colors duration-200 group-hover:text-dim">
                {subline}
              </span>
            </span>
          </Link>

          {/* Desktop links — right-side cluster (links → live pill → CTA) */}
          <ul className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map(link => (
              <li key={link.href}>
                <a href={link.href}
                   className="text-sm font-normal tracking-[0.02em] text-dim transition-colors duration-200 hover:text-accent">
                  {link.label}
                </a>
              </li>
            ))}

            <li>
              <NavUserMenu variant="desktop" />
            </li>

            {/* Live services badge — sits between nav links and CTA */}
            <li>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/5 px-3 py-1">
                <Zap size={9} className="text-accent" />
                <span className="font-mono text-[0.58rem] tracking-[0.12em] text-accent">
                  {LIVE_COUNT} LIVE
                </span>
              </div>
            </li>

            <li>
              <a href="#contact" className="btn-ghost text-sm">
                Get in Touch
              </a>
            </li>
          </ul>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent-dim text-[#dde4f0] transition-colors hover:border-accent md:hidden"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
        </nav>
      </header>

      {/* ─────────────────────────────────────────────────────
          MOBILE MENU — compact slide-down sheet
          Anchored to top (below navbar), no full-screen overlay,
          takes only the height it needs, no scrolling required.
          ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop — tappable to close */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-[290]"
              style={{ background: 'rgba(4,8,15,0.65)', backdropFilter: 'blur(8px)' }}
            />

            {/* Sheet — slides down from below the navbar */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-0 right-0 z-[300] mx-3 rounded-2xl overflow-hidden"
              style={{
                top: 'calc(28px + 56px + 8px)',   /* TopBar + Navbar + gap */
                background: 'rgba(6,12,24,0.97)',
                backdropFilter: 'blur(32px)',
                border: '1px solid rgba(0,229,184,0.15)',
                boxShadow: '0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,229,184,0.05)',
              }}
            >
              {/* Header row */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-accent/10">
                <span className="font-mono text-[0.6rem] tracking-[0.18em] uppercase text-dim">
                  Navigation
                </span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/15 text-dim transition-colors hover:border-accent hover:text-accent"
                  aria-label="Close menu"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Nav links — compact, full-width tap targets */}
              <nav className="px-3 py-3">
                {[...NAV_LINKS, { label: 'Contact', href: '#contact' }].map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.2 }}
                    className="flex items-center justify-between rounded-xl px-4 py-3.5 text-[#dde4f0] transition-all duration-150 hover:bg-accent/8 hover:text-accent group"
                  >
                    <span className="font-body text-base font-medium tracking-[-0.01em]">
                      {link.label}
                    </span>
                    <span className="text-dim transition-all duration-150 group-hover:text-accent group-hover:translate-x-0.5 text-sm">
                      →
                    </span>
                  </motion.a>
                ))}
                <div className="mt-1 border-t border-accent/10 pt-2">
                  <NavUserMenu variant="mobile" />
                </div>
              </nav>

              {/* Footer strip */}
              <div className="px-5 py-3 border-t border-accent/10 flex items-center justify-between">
                <span className="font-mono text-[0.58rem] text-dim/60 tracking-wider">
                  tythys.com
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-50" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                  </span>
                  <span className="font-mono text-[0.58rem] text-accent tracking-wider">
                    {LIVE_COUNT} Live
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
