import type { PropsWithChildren } from 'react'
import { Link, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { CommandBar } from './CommandBar'

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Contact Module', href: '/contact' },
  { label: 'User Creation', href: '/users/new' },
  { label: 'Authentication', href: '/auth/login' },
]

export const AppFrame = ({ children }: PropsWithChildren) => {
  const location = useLocation()

  return (
    <div className="app-shell">
      <aside className="sidebar panel">
        <div>
          <p className="branding-kicker">Brand Placeholder</p>
          <h1 className="branding-title">Observability Control Center</h1>
          <p className="branding-subtitle">Enterprise platform operations</p>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              className={clsx('nav-link', location.pathname === item.href && 'active')}
              key={item.href}
              to={item.href}
            >
              <span className="truncate" title={item.label}>
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
        <p className="sidebar-note">
          HUD placeholder: notifications, tenant switcher, profile, environment.
        </p>
      </aside>
      <main className="main-content">
        <CommandBar />
        {children}
      </main>
      <footer className="app-footer panel">
        Footer placeholder: legal, compliance, SLAs, audit links, release metadata.
      </footer>
    </div>
  )
}
