import Link from 'next/link'
import { Lock, Mail } from 'lucide-react'
import { AuthShell } from '@/components/auth/AuthShell'

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Access"
      title="Welcome back to TythysOne"
      subtitle="Sign in to view your workspace, service telemetry, and account settings."
      secondaryCta={{ label: 'Create account', href: '/auth/signup' }}
    >
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="status-badge border-ok/40 bg-ok/[0.08] text-ok">Secure login</span>
        <span className="status-badge border-accent/30 bg-accent/[0.06] text-accent">Single workspace</span>
      </div>

      <form className="grid gap-4" action="#" method="post">
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[0.72rem] tracking-[0.03em] text-dim">Email</label>
          <div className="relative">
            <Mail size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@company.com"
              className="field-input pl-9"
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[0.72rem] tracking-[0.03em] text-dim">Password</label>
          <div className="relative">
            <Lock size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Enter password"
              className="field-input pl-9"
              required
            />
          </div>
        </div>

        <div className="mt-1 flex items-center justify-between gap-3">
          <Link href="/auth/forgot-password" className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-accent transition-colors hover:text-gold">
            Forgot password?
          </Link>
          <button type="submit" className="btn-primary min-w-[152px] px-6 py-2.5 text-sm">
            Sign in
          </button>
        </div>
      </form>

      <p className="mt-5 border-t border-accent-dim pt-4 text-[0.78rem] font-light leading-[1.65] text-dim">
        New to the platform?{' '}
        <Link href="/auth/signup" className="text-accent transition-colors hover:text-gold">
          Create your account
        </Link>
        .
      </p>
    </AuthShell>
  )
}
