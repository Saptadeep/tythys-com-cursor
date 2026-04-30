import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

type Role = 'admin' | 'user'

type Handler<Ctx> = (req: Request, ctx: Ctx) => Promise<Response> | Response

export type AuthContext = {
  user: { email: string; role: Role; name?: string | null }
}

export function withAuth<Ctx>(opts: { role?: Role } = {}, handler: Handler<Ctx & AuthContext>): Handler<Ctx> {
  return async (req, ctx) => {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ ok: false, error: 'Unauthenticated.' }, { status: 401 })
    }

    const role = (session.user as { role?: Role }).role ?? 'user'
    if (opts.role && role !== opts.role) {
      return NextResponse.json({ ok: false, error: 'Forbidden.' }, { status: 403 })
    }

    return handler(req, {
      ...ctx,
      user: { email: session.user.email, role, name: session.user.name },
    } as Ctx & AuthContext)
  }
}
