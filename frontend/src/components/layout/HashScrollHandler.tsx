'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { scrollToLandingSection } from '@/components/layout/LandingSectionLink'

/**
 * After client navigation to `/` with a hash (e.g. `/#pillars`), scroll to the section.
 */
export function HashScrollHandler() {
  const pathname = usePathname() ?? '/'

  useEffect(() => {
    if (pathname !== '/') return

    const run = () => {
      const raw = window.location.hash
      if (!raw || raw === '#') return
      const id = decodeURIComponent(raw.slice(1))
      if (!id) return
      scrollToLandingSection(id)
    }

    const t = window.setTimeout(run, 0)
    window.addEventListener('hashchange', run)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('hashchange', run)
    }
  }, [pathname])

  return null
}
