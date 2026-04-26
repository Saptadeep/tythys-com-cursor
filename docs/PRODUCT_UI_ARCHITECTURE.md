# API Revenue Guard UI Architecture

This document defines the production-intent UI foundation for the app in `c:\tythys-com-cursor\frontend`.

## Theme choice and rationale

- Theme: enterprise dark control plane
- Card edges: moderately square (`8px`) for a strict and professional B2B posture
- Visual priorities:
  - actionability over decorative elements
  - readable data density
  - extensible module shell

## Layout system

- Global app shell: sidebar + topbar + content + footer
- Main shell component:
  - `src/components/layout/AppShell.tsx`
- Navigation config:
  - `src/config/modules.ts`

## Placeholder components intentionally left for customization

- Branding placeholders:
  - `PLACEHOLDER_BRAND` in `src/config/modules.ts`
- HUD placeholder:
  - `src/components/layout/HudPlaceholder.tsx`
- Footer placeholder:
  - `src/components/layout/Footer.tsx`

## Mocked extension modules

- Contact module:
  - UI: `src/app/contact/page.tsx`
  - API: `src/app/api/contact/route.ts`
- Auth module (mock only):
  - Login: `src/app/auth/login/page.tsx`
  - Signup: `src/app/auth/signup/page.tsx`
  - Forgot password: `src/app/auth/forgot-password/page.tsx`
  - APIs:
    - `src/app/api/auth/login/route.ts`
    - `src/app/api/auth/google/route.ts`
    - `src/app/api/auth/signup/route.ts`
    - `src/app/api/auth/forgot-password/route.ts`

## Embedded observability module notes

- Embedded app path:
  - `frontend/observability-control-center`
- Compatibility adjustments for root Next build:
  - Router migrated to data router pattern (`createBrowserRouter` + `RouterProvider`)
  - metrics env access normalized for Next TS checks
  - required package dependencies installed at root frontend
- Guideline:
  - keep the embedded module build-compatible with root `npm run build`
  - avoid Vite-only globals unless isolated by separate tsconfig/project boundaries

## Overview ingestion visibility

- Overview page now includes an `Ingestion Status` card:
  - `src/app/page.tsx`
- Card data source:
  - Next API route: `src/app/api/ingest/latest/route.ts`
  - Backend client integration: `src/lib/backend.ts`
- Displayed metrics:
  - service id
  - total ingested events
  - recent window event count
  - recent 5xx count
  - last event timestamp

## Planned real implementation path

1. Replace mock auth routes with real auth provider integration.
2. Enforce Google SSO only in production auth policy.
3. Replace contact mock route with backend email/workflow service.
4. Replace placeholder modules with backend-powered incident/endpoint/timeline views.

## Styling extension rules

- Global design tokens live in `src/app/globals.css`.
- Reusable primitives:
  - `.card`, `.metric`, `.status`, `.btn`, `.field`
- Keep new module pages inside `AppShell` and use existing primitives before adding new style variants.
