import { NextResponse } from 'next/server'
import type { ZodType } from 'zod'

export type ParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; response: NextResponse }

export async function parseJson<T>(req: Request, schema: ZodType<T>): Promise<ParseResult<T>> {
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 }),
    }
  }

  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          ok: false,
          error: 'Validation failed.',
          detail: parsed.error.issues.map((i) => ({
            path: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 400 },
      ),
    }
  }

  return { ok: true, data: parsed.data }
}
