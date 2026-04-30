import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/auth/signin?from=/admin/analytics')
  }
  return <>{children}</>
}
