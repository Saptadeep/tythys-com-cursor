'use client'
// src/components/layout/Navbar.tsx
import { useState, useEffect }  from 'react'
import Link                     from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Zap }         from 'lucide-react'
import { cn }                   from '@/lib/cn'
import { SERVICES }             from '@/config/services'

const NAV_LINKS = [
  { label: 'Products', href: '#products' },
  { label: 'Approach', href: '#process'  },
  { label: 'About',    href: '#about'    },
]

const LIVE_COUNT = SERVICES.filter(s => s.status === 'live').length

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

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
          <Link href="/" className="flex items-center gap-0.5 font-display text-[1.35rem] font-bold tracking-[-0.01em] text-[#dde4f0] sm:text-[1.55rem]">
            <span className="text-accent">T</span>
            <span>ythys</span>
            <span className="mb-2.5 ml-0.5 inline-block h-[5px] w-[5px] flex-shrink-0 rounded-full bg-gold" />
          </Link>

          {/* Live services badge */}
          <div className="hidden items-center gap-1.5 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 xs:flex">
            <Zap size={9} className="text-accent" />
            <span className="font-mono text-[0.58rem] tracking-[0.12em] text-accent">
              {LIVE_COUNT} LIVE
            </span>
          </div>

          {/* Desktop links */}
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

      {/* Mobile overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[300] flex flex-col items-center justify-center gap-0"
            style={{ background: 'rgba(4,8,15,0.97)', backdropFilter: 'blur(24px)' }}
          >
            {/* Close */}
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-lg border border-accent-dim text-[#dde4f0] sm:right-6 sm:top-5"
              aria-label="Close menu"
            >
              <X size={16} />
            </button>

            {/* Label */}
            <p className="font-mono text-[0.62rem] tracking-[0.18em] uppercase text-dim mb-8">Navigate</p>

            {/* Links */}
            <motion.nav className="flex flex-col items-center gap-1">
              {[...NAV_LINKS, { label: 'Contact', href: '#contact' }].map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="font-display text-[clamp(1.9rem,8vw,2.7rem)] font-light text-[#dde4f0] py-2 transition-colors hover:text-accent"
                >
                  {link.label}
                </motion.a>
              ))}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
