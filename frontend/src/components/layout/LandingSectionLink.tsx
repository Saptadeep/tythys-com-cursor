'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/** Fixed chrome: TopBar (~28px) + Navbar (~56px) + small gap */
export const LANDING_NAV_SCROLL_OFFSET_PX = 96

export function scrollToLandingSection(sectionId: string) {
  const el = document.getElementById(sectionId)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - LANDING_NAV_SCROLL_OFFSET_PX
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
}

type LandingSectionLinkProps = {
  sectionId: string
  className?: string
  children: React.ReactNode
  /** e.g. close mobile menu before navigating */
  onAfterClick?: () => void
}

/**
 * Deep-links to `/#{sectionId}` on the marketing home.
 * When already on `/`, scroll in place (SPA navigations do not always honour hashes).
 */
export function LandingSectionLink({ sectionId, className, children, onAfterClick }: LandingSectionLinkProps) {
  const pathname = usePathname() ?? '/'
  const href = `/#${sectionId}`

  return (
    <Link
      href={href}
      scroll={false}
      className={className}
      onClick={(e) => {
        onAfterClick?.()
        if (pathname !== '/') return
        e.preventDefault()
        scrollToLandingSection(sectionId)
        window.history.replaceState(null, '', href)
      }}
    >
      {children}
    </Link>
  )
}
