import Link from 'next/link'
import { Building2, Lock, Mail, User } from 'lucide-react'
import { AuthShell } from '@/components/auth/AuthShell'

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="Registration"
      title="Create your TythysOne account"
      subtitle="Set up workspace access for observability, engineering tools, and service operations."
      secondaryCta={{ label: 'Already have an account?', href: '/auth/login' }}
    >
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="status-badge border-accent/30 bg-accent/[0.06] text-accent">Fast onboarding</span>
        <span className="status-badge border-gold/30 bg-gold/[0.08] text-gold">Role-ready account</span>
      </div>

      <form className="grid gap-4" action="#" method="post">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[0.72rem] tracking-[0.03em] text-dim">Full name</label>
            <div className="relative">
              <User size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
              <input type="text" name="name" className="field-input pl-9" placeholder="Alex Morgan" required />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[0.72rem] tracking-[0.03em] text-dim">Company</label>
            <div className="relative">
              <Building2 size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
              <input type="text" name="company" className="field-input pl-9" placeholder="Company name" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[0.72rem] tracking-[0.03em] text-dim">Email</label>
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

        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[0.72rem] tracking-[0.03em] text-dim">Password</label>
          <div className="relative">
            <Lock size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              className="field-input pl-9"
              placeholder="Minimum 8 characters"
              required
            />
          </div>
        </div>

        <div className="mt-1 flex items-center justify-between gap-3">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-dim">
            By continuing, you agree to account terms.
          </p>
          <button type="submit" className="btn-primary min-w-[172px] px-6 py-2.5 text-sm">
            Create account
          </button>
        </div>
      </form>

      <p className="mt-5 border-t border-accent-dim pt-4 text-[0.78rem] font-light leading-[1.65] text-dim">
        Already registered?{' '}
        <Link href="/auth/login" className="text-accent transition-colors hover:text-gold">
          Sign in here
        </Link>
        .
      </p>
    </AuthShell>
  )
}
