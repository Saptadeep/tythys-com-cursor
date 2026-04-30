import Link from 'next/link'
import { auth, signOut } from '@/lib/auth'

async function signOutAction() {
  'use server'
  await signOut({ redirectTo: '/' })
}

export async function UserMenu({ variant = 'desktop' }: { variant?: 'desktop' | 'mobile' }) {
  const session = await auth()

  if (!session?.user) {
    return (
      <Link
        href="/auth/signin"
        className={
          variant === 'desktop'
            ? 'text-sm font-normal tracking-[0.02em] text-dim transition-colors duration-200 hover:text-accent'
            : 'flex items-center justify-between rounded-xl px-4 py-3.5 text-[#dde4f0] transition-all duration-150 hover:bg-accent/8 hover:text-accent'
        }
      >
        Sign in
      </Link>
    )
  }

  const initial = (session.user.email ?? '?').slice(0, 1).toUpperCase()

  if (variant === 'mobile') {
    return (
      <form action={signOutAction} className="flex items-center justify-between rounded-xl px-4 py-3.5">
        <span className="font-body text-base font-medium tracking-[-0.01em] text-[#dde4f0]">
          {session.user.email}
        </span>
        <button type="submit" className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-accent">
          Sign out
        </button>
      </form>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {session.user.role === 'admin' ? (
        <Link
          href="/admin/analytics"
          className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-gold transition-colors hover:text-accent"
        >
          Admin
        </Link>
      ) : null}
      <span
        title={session.user.email ?? undefined}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-accent/30 bg-accent/[0.08] font-mono text-[0.7rem] text-accent"
      >
        {initial}
      </span>
      <form action={signOutAction}>
        <button
          type="submit"
          className="text-sm font-normal tracking-[0.02em] text-dim transition-colors duration-200 hover:text-accent"
        >
          Sign out
        </button>
      </form>
    </div>
  )
}
