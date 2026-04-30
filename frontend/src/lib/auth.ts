import NextAuth, { type DefaultSession } from 'next-auth'
import Google from 'next-auth/providers/google'

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      role: 'admin' | 'user'
    }
  }
}

function adminAllowlist(): Set<string> {
  const raw = process.env.ADMIN_EMAILS ?? 'sd@tythys.com'
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  )
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: 'jwt' },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.email) {
        const allow = adminAllowlist()
        token.role = allow.has(user.email.toLowerCase()) ? 'admin' : 'user'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as 'admin' | 'user') ?? 'user'
      }
      return session
    },
    async authorized({ request, auth: session }) {
      const { pathname } = request.nextUrl
      if (pathname.startsWith('/admin')) {
        return Boolean(session?.user && session.user.role === 'admin')
      }
      return true
    },
  },
})

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return adminAllowlist().has(email.toLowerCase())
}
