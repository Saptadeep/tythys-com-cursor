'use client'

import Link from 'next/link'
import { signIn, signOut, useSession } from 'next-auth/react'

export function NavUserMenu({ variant = 'desktop' }: { variant?: 'desktop' | 'mobile' }) {
  const { data: session, status } = useSession()
  const isAuthed = status === 'authenticated' && session?.user
  const isAdmin = isAuthed && (session?.user as { role?: string })?.role === 'admin'

  if (!isAuthed) {
    if (variant === 'mobile') {
      return (
        <button
          type="button"
          onClick={() => signIn('google')}
          className="flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-[#dde4f0] transition-all duration-150 hover:bg-accent/8 hover:text-accent"
        >
          <span className="font-body text-base font-medium tracking-[-0.01em]">Sign in</span>
          <span className="text-dim transition-all duration-150 group-hover:text-accent text-sm">→</span>
        </button>
      )
    }
    return (
      <button
        type="button"
        onClick={() => signIn('google')}
        className="text-sm font-normal tracking-[0.02em] text-dim transition-colors duration-200 hover:text-accent"
      >
        Sign in
      </button>
    )
  }

  const initial = (session.user?.email ?? session.user?.name ?? '?').slice(0, 1).toUpperCase()

  if (variant === 'mobile') {
    return (
      <div className="flex flex-col gap-2 px-4 py-3">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-dim">
          {session.user?.email}
        </span>
        {isAdmin ? (
          <Link
            href="/admin/analytics"
            className="font-mono text-[0.66rem] uppercase tracking-[0.1em] text-gold hover:text-accent"
          >
            Admin analytics
          </Link>
        ) : null}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="self-start rounded-lg border border-accent/30 bg-accent/[0.06] px-3 py-1.5 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-accent transition-colors hover:bg-accent/[0.12]"
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2.5">
      {isAdmin ? (
        <Link
          href="/admin/analytics"
          className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-gold transition-colors hover:text-accent"
        >
          Admin
        </Link>
      ) : null}
      <span
        title={session.user?.email ?? undefined}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-accent/30 bg-accent/[0.08] font-mono text-[0.7rem] text-accent"
      >
        {initial}
      </span>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: '/' })}
        className="text-sm font-normal tracking-[0.02em] text-dim transition-colors duration-200 hover:text-accent"
      >
        Sign out
      </button>
    </div>
  )
}
