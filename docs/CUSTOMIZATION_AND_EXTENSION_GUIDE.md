# Customization and Extension Guide

## Branding customization

Edit `c:\tythys-com-cursor\frontend\src\config\modules.ts`:

- `productName`
- `companyName`
- `topbarTagline`

## Theme customization

Edit `c:\tythys-com-cursor\frontend\src\app\globals.css` variables:

- `--bg-*` for palette
- `--text-*` for typography contrast
- `--accent`, `--ok`, `--warn`, `--err`
- `--radius` to switch between squarer/rounder cards

## Ingestion status integration

Current frontend ingestion route:

- `src/app/api/ingest/latest/route.ts`

Current backend integration helper:

- `src/lib/backend.ts` via `getIngestionLatest()`

In real backend mode, set:

- `BACKEND_BASE_URL` to your backend v1 base URL
- `INGEST_API_KEY` to match backend ingest guard

In mock backend mode, ingestion status is generated locally in `src/lib/backend.ts`.

## Embedded observability-control-center maintenance

If root `npm run build` fails due to files under `frontend/observability-control-center`:

1. Ensure dependencies exist in root frontend:
   - `react-router-dom`
   - `recharts`
   - `vite`
   - `@vitejs/plugin-react`
2. Prefer data-router style in module router (`createBrowserRouter` + `RouterProvider`).
3. Avoid Vite-only globals in shared TS scope (e.g. `import.meta.env`); use env access compatible with current toolchain.
4. Re-run:
   - `npm run build`

## Adding a new module page

1. Add module entry in `src/config/modules.ts`.
2. Create route under `src/app/<module>/page.tsx`.
3. Wrap content with `AppShell`.
4. Use existing `.card`, `.metric`, `.btn`, `.field` primitives.

## Replacing mock auth with production auth

Current mock routes:

- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/google/route.ts`
- `src/app/api/auth/signup/route.ts`
- `src/app/api/auth/forgot-password/route.ts`

Replace with:

1. OAuth provider (Google only) callback routes.
2. Session/token issuance.
3. Protected route middleware.
4. Server-side role/tenant checks.

## Replacing mock contact route

Current mock route:

- `src/app/api/contact/route.ts`

Replace with:

1. Validation layer
2. Lead write to CRM/store
3. Owner notification email/workflow
4. Rate limiting and abuse controls

## Production hardening checklist (frontend)

- CSP headers
- secure cookie/session strategy
- audit logging for auth events
- error boundary and fallback UX
- accessibility pass (keyboard/focus/contrast)
- performance budget tracking
