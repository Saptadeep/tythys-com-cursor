import Link from 'next/link'
import { Github, Linkedin } from 'lucide-react'

const LINKS = [
  { label: 'Privacy',  href: '#' },
  { label: 'Terms',    href: '#' },
  { label: 'GitHub',   href: '#', icon: Github    },
  { label: 'LinkedIn', href: '#', icon: Linkedin  },
]

export function Footer() {
  return (
    <footer className="relative z-[155] border-t border-accent-dim/60 bg-bg/40">
      <div className="mx-auto max-w-[1300px] px-4 py-6 sm:px-7 md:px-10 lg:px-16 xl:px-20">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">

          {/* Wordmark + tagline */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex flex-col leading-tight">
                <span className="font-display text-[1.05rem] font-bold tracking-[-0.025em] text-[#dde4f0]">
                  Tythys<span className="text-accent">One</span>
                </span>
                <span className="font-mono text-[0.58rem] uppercase tracking-[0.22em] text-dim/70">
                  Control Plane
                </span>
              </span>
            </Link>
            <p className="max-w-xs font-mono text-[0.64rem] leading-relaxed text-dim">
              Quantitative reasoning, modeling, and scientific thinking &mdash; turned into working software.
            </p>
          </div>

          <span className="font-mono text-[0.6rem] text-dim/80">
            © 2025 Tythys · All systems observational.
          </span>

          {/* Links */}
          <div className="flex items-center gap-4">
            {LINKS.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                className="flex items-center gap-1 font-mono text-[0.6rem] uppercase tracking-wider text-dim/80 transition-colors duration-200 hover:text-accent"
              >
                {Icon && <Icon size={12} />}
                {!Icon && label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}