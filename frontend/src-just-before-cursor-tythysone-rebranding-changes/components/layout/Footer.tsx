import { Github, Linkedin } from 'lucide-react'

const LINKS = [
  { label: 'Privacy',  href: '#' },
  { label: 'Terms',    href: '#' },
  { label: 'GitHub',   href: '#', icon: Github    },
  { label: 'LinkedIn', href: '#', icon: Linkedin  },
]

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-accent-dim/60 bg-bg/40">
      <div className="mx-auto max-w-[1300px] px-4 py-6 sm:px-7 md:px-10 lg:px-16 xl:px-20">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">

          {/* Wordmark + tagline */}
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <a href="#" className="inline-flex items-center gap-2">
              <span className="rounded-full bg-accent/12 px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.22em] text-accent">
                TYTHYS&nbsp;ONE
              </span>
            </a>
            <p className="max-w-xs font-mono text-[0.65rem] leading-relaxed text-dim">
              Multiservice control surface for engineers, operators, and founders.
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