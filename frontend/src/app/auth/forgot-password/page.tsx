import Link from 'next/link'
import { Mail, RefreshCw } from 'lucide-react'
import { AuthShell } from '@/components/auth/AuthShell'

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Recovery"
      title="Reset your password"
      subtitle="Enter your account email and we will send a secure password reset link."
      secondaryCta={{ label: 'Back to login', href: '/auth/login' }}
    >
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="status-badge border-warn/40 bg-warn/[0.08] text-warn">Recovery flow</span>
        <span className="status-badge border-accent/30 bg-accent/[0.06] text-accent">Email verification</span>
      </div>

      <form className="grid gap-4" action="#" method="post">
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[0.72rem] tracking-[0.03em] text-dim">Account email</label>
          <div className="relative">
            <Mail size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
            <input
              type="email"
              name="email"
              autoComplete="email"
              className="field-input pl-9"
              placeholder="you@company.com"
              required
            />
          </div>
        </div>

        <div className="mt-1 flex items-center justify-between gap-3">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-dim">
            Reset links expire for security.
          </p>
          <button type="submit" className="btn-primary min-w-[172px] px-6 py-2.5 text-sm">
            Send reset link
          </button>
        </div>
      </form>

      <div className="mt-5 border-t border-accent-dim pt-4">
        <Link href="/auth/login" className="inline-flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-accent transition-colors hover:text-gold">
          <RefreshCw size={12} />
          Remembered your password? Sign in
        </Link>
      </div>
    </AuthShell>
  )
}
