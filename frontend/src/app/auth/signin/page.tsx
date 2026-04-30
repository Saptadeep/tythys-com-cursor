import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth, signIn } from '@/lib/auth'
import { AuthShell } from '@/components/auth/AuthShell'

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to Tythys with your Google account.',
  robots: { index: false, follow: false },
}

type SignInPageProps = {
  searchParams?: Promise<{ from?: string; error?: string }>
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await auth()
  const params = (await searchParams) ?? {}
  const from = params.from && params.from.startsWith('/') ? params.from : '/'

  if (session?.user) {
    redirect(from)
  }

  async function signInWithGoogle() {
    'use server'
    await signIn('google', { redirectTo: from })
  }

  return (
    <AuthShell
      eyebrow="Access"
      title="Sign in to Tythys"
      subtitle="Continue with your Google account. Admin tools require an allowlisted address."
    >
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="status-badge border-ok/40 bg-ok/[0.08] text-ok">Secure sign-in</span>
        <span className="status-badge border-accent/30 bg-accent/[0.06] text-accent">Google OAuth</span>
      </div>

      {params.error ? (
        <p className="mb-4 rounded-lg border border-warn/30 bg-warn/[0.08] px-3 py-2 text-sm text-warn">
          Sign-in failed. Please try again.
        </p>
      ) : null}

      <form action={signInWithGoogle} className="grid gap-3">
        <button type="submit" className="btn-primary min-w-[152px] px-6 py-2.5 text-sm">
          Continue with Google
        </button>
      </form>

      <p className="mt-5 border-t border-accent-dim pt-4 text-[0.78rem] font-light leading-[1.65] text-dim">
        By continuing you agree to use the platform responsibly. Sessions are issued as signed JWT cookies on this device only.
      </p>
    </AuthShell>
  )
}
