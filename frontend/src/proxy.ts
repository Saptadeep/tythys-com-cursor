import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export default auth((req) => {
  const { pathname, search } = req.nextUrl

  if (pathname.startsWith('/admin')) {
    const session = req.auth
    if (!session?.user || session.user.role !== 'admin') {
      const signInUrl = new URL('/auth/signin', req.url)
      signInUrl.searchParams.set('from', `${pathname}${search}`)
      return NextResponse.redirect(signInUrl)
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*'],
}
