// src/components/layout/Footer.tsx
import { Github, Linkedin } from 'lucide-react'

const TEXT_LINKS = [
  { label: 'Privacy', href: '#' },
  { label: 'Terms',   href: '#' },
]

const ICON_LINKS = [
  { label: 'GitHub',   href: '#', icon: Github   },
  { label: 'LinkedIn', href: '#', icon: Linkedin  },
]

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-accent-dim">
      <div className="mx-auto max-w-[1300px] px-4 py-5 sm:px-7 md:px-10 lg:px-16 xl:px-20">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-0">

          {/* ── Logo — TythysOne wordmark ── */}
          <a
            href="#"
            className="flex-shrink-0 leading-none"
            style={{
              fontFamily:    "'Fraunces', Georgia, serif",
              fontWeight:    900,
              fontStyle:     'italic',
              fontSize:      '1.2rem',
              letterSpacing: '-0.025em',
              textDecoration: 'none',
            }}
          >
            <span style={{ color: '#dde4f0' }}>Tythys</span>
            <span style={{ color: '#00e5b8' }}>One</span>
          </a>

          {/* ── Centre: copyright + tagline ── */}
          <div className="flex flex-col items-center gap-1 text-center sm:gap-0.5">
            <span
              className="text-dim"
              style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.72rem', fontWeight: 300 }}
            >
              © 2025 Tythys · tythys.com
            </span>
            <span
              className="font-mono text-dim/50"
              style={{ fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}
            >
              Building in public · v1.0.0
            </span>
          </div>

          {/* ── Right: text links + icon links ── */}
          <div className="flex items-center gap-5">
            {TEXT_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-dim transition-colors duration-200 hover:text-accent"
                style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.75rem', fontWeight: 400 }}
              >
                {label}
              </a>
            ))}

            {/* Vertical divider */}
            <span className="h-3 w-px bg-accent-dim" />

            {ICON_LINKS.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="text-dim transition-colors duration-200 hover:text-accent"
              >
                <Icon size={14} />
              </a>
            ))}
          </div>

        </div>
      </div>
    </footer>
  )
}
