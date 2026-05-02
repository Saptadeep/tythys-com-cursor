# SESSION HANDOFF

Last updated: 2026-05-01 (session close — **paused**: no further product extension queued; Week 6 human-validation items + optional SEO tidy remain; **GTM copy for GatewaySight** captured under `docs/sales/`)
Workspace root: `c:\tythys-com-cursor`
Instruction mode: CMD instructions only
Latest commit on `main`: verify with `git log -1 --oneline` after pull (doc-only updates may land after product deploys).
Recent history: `git log -8 --oneline` (handoff + GatewaySight GTM brief landed 2026-05-01 evening).
After pull/push: redeploy Vercel and smoke `https://tythys.com/icon.svg` + `https://tythys.com/apple-icon`.

> Read top-to-bottom. The first half captures the **current state** of the
> project. The second half (under "Prior Context") preserves the earlier
> API-Revenue-Guard handoff verbatim for traceability — those subsystems
> are still in the repo, but they are no longer the active workstream.

---

## 1. Strategic pivot taken this session (2026-04-28)

The project was reframed from "API Revenue Guard control-plane" toward a
broader, more durable identity for **Tythys** as a whole:

> Tythys turns **quantitative reasoning, modeling, scientific thinking,**
> and **problem-solving + software** into focused tools, validated against
> real results.

Four pillars are now the explicit operating spine of the product,
the marketing site, and every future build decision:

| Pillar | Symbol | Short |
|---|---|---|
| Quantitative Reasoning | `Σ` | Numbers that mean something |
| Modeling | `∇` | Math that mirrors reality |
| Scientific Thinking | `⚛` | Hypothesis · test · revise |
| Problem-Solving + Software | `⟶` | From insight to interface |

Defined once in `frontend/src/config/services.ts` (`PILLARS` constant) and
threaded through the entire UI. Edit that array → Hero stats, the new
Pillars section, and pillar chips on every product card all update.

The pivot also dropped the earlier idea of pursuing third-party A-level /
edX / Coursera certifications. The decision was: **certificates are
optional; the products themselves are the credential.** Each product
exercises at least one pillar, and the act of building it is the
curriculum.

---

## 2. Current state of the codebase (2026-04-29)

### 2.1  Marketing site UI — aligned to the four pillars

Edited:
- `frontend/src/types/index.ts` — added `Pillar` type, optional `pillars` on `Service`.
- `frontend/src/config/services.ts` — added `PILLARS` array; mapped each Service to its pillars; rewrote `PROCESS_STEPS` as the **frame → model → test → ship** learn-by-building loop.
- `frontend/src/components/sections/Hero.tsx` — badge, headline, stats row, subtitle now name the pillars.
- `frontend/src/components/sections/Pillars.tsx` — **new** section, sits between Hero and Products, renders the 4-card grid + the `reason → model → test → ship · repeat` operating-loop strip.
- `frontend/src/components/sections/Products.tsx` — every product card now shows colour-coded pillar chips; intro copy rewritten.
- `frontend/src/components/sections/About.tsx` — narrative reframed to "I learn by building — pillars are internalised by being put to work on something real."
- `frontend/src/components/layout/Navbar.tsx` — added `Pillars` link.
- `frontend/src/components/layout/Footer.tsx` — tagline rewritten to match positioning.
- `frontend/src/app/page.tsx` — `<Pillars />` wired into the section flow.
- `frontend/src/app/layout.tsx` — `<title>`, description, OG tags, SEO keywords rewritten around the four pillars.

Earlier control-plane / API Revenue Guard pages remain untouched and live
at `/gateway-observability` and the existing `/api/*` routes. They are
still part of Tythys; they're just no longer the sole story the site tells.

### 2.2  EngineerCalc — Week 1 of the 6-week ship plan landed

EngineerCalc is the **first product** we are building together end-to-end.
It is a focused web tool that solves the four most common beam-loading
problems for a simply-supported beam (point load at centre, point load at
arbitrary position, full-span UDL, end moment) and returns reactions,
deflection, bending moment, shear, and (optionally) bending stress, all
validated against *Roark's Formulas for Stress and Strain*.

**Why this product first** is documented in
`docs/products/engineer-calc/00-spec.md`. Short version: it is the rare
problem that is simultaneously a saleable tool **and** the canonical
undergraduate mechanics curriculum. Building it teaches the math that the
rest of the product roadmap depends on.

Files added this session:
- `docs/products/engineer-calc/00-spec.md` — product spec: scope, success gates, monetisation plan, 6-week schedule.
- `docs/products/engineer-calc/01-physics.md` — **the curriculum**. Euler–Bernoulli derivation, sign conventions, closed-form solutions for all four load cases, Roark cross-references. Read this first when resuming.
- `backend/app/services/beam_calc/__init__.py` — public surface.
- `backend/app/services/beam_calc/types.py` — Pydantic v2 schemas (`BeamSolveRequest`, `BeamSolveResponse`, `LoadCase` discriminated union, `BeamMaterial`, `BeamSection`, `CurveSamples`).
- `backend/app/services/beam_calc/cases.py` — closed-form kernels for the four load cases. Pure functions, no NumPy dependency in the hot path.
- `backend/app/services/beam_calc/solve.py` — public `solve(request)` orchestrator that dispatches on load kind and shapes the response.
- `backend/tests/test_beam_calc.py` — 26-test validation suite. Formula tests, Roark numeric reference tests, public-API tests, edge-case tests.
- `backend/scripts/verify_beam_refs.py` — independent re-derivation of the four numeric reference values used in the test suite (third witness, run as a sanity check).

### 2.3  EngineerCalc Week 3 — FastAPI route + integration tests (this session, 2026-04-29)

Files added or edited:
- `backend/app/api/routes/beam_calc.py` — **new**. `POST /v1/beam-calc/solve`. The single place that does unit conversion: `?units=imperial` interprets the request as ft / lbf / lbf·ft / lbf/ft / psi / in⁴ / in / lbf·in² and returns the response in the same imperial units. Domain and validation errors → HTTP 422.
- `backend/app/main.py` — included `beam_calc_router` under `/v1`.
- `backend/app/services/beam_calc/types.py` — added `units: Literal["si","imperial"] = "si"` to `BeamSolveResponse` (additive, non-breaking; the core solver always writes `"si"`, the route flips to `"imperial"` after conversion).
- `backend/tests/test_beam_calc_api.py` — **new**. 9 `TestClient` tests: 4 happy-path Roark references (one per load case), 1 response-shape contract, 3 validation-error tests (negative span, point-load outside span, unknown load discriminator), 1 imperial round-trip pinning the conversion factors.
- `backend/requirements.txt` — added `httpx==0.28.1` (Starlette `TestClient` dependency that wasn't pinned).
- `frontend/src/app/api/beam-calc/solve/route.ts` — **new**. Next.js proxy: `POST /api/beam-calc/solve` → backend `/v1/beam-calc/solve`. Forwards body + `units` query, surfaces 422 with the structured backend payload so the Week-4 UI can render field-level messages without re-doing validation client-side.
- `frontend/src/config/services.ts` — `beam-calc.apiEndpoint` updated from the placeholder `/api/services/beam-calc` to the real `/api/beam-calc/solve`.
- `docs/products/engineer-calc/02-learnings.md` — **new**. Journal of Week-2 + Week-3 lessons.

### 2.4  EngineerCalc Week 4 — frontend page wiring (this session, 2026-04-29)

Files added or edited:
- `frontend/src/app/beam-calculator/page.tsx` — **new** live page wired to `/api/beam-calc/solve`; includes:
  - SI / Imperial toggle that drives `?units=<si|imperial>`
  - typed input form for span, E, I, optional `c`, sample points, and all four load cases
  - response panel showing reactions, maxima, EI, Roark reference
  - 3 `recharts` plots: deflection, bending moment, shear
- `frontend/src/components/sections/Products.tsx` — removed the hard-coded `beam-calc` "Coming Soon" badge override and removed the special-case blocking of live chip/link behavior for `beam-calc`. Card behavior now follows `status` + `apiEndpoint` like other products.

### 2.5  EngineerCalc Week 5 — section library + export + UX + Vitest smoke gate (2026-04-29 → 2026-04-30)

Files added or edited:
- `frontend/src/app/beam-calculator/page.tsx` — added section workflow with `custom`, `rectangle`, `circle`, and starter `w_shape` presets; added inline field-level validation rendering from backend 422 payload shape; improved unit-aware placeholders and empty state messaging; added deterministic PDF export flow (`window.print`) that includes inputs, key outputs, Roark reference, and embedded chart SVGs.
- `docs/products/engineer-calc/03-ui-design.md` — **new** UI conventions doc (screen structure, chart conventions, suffix references, validation behavior, export flow).

Frontend smoke gate (added 2026-04-30, replaces the original Playwright scaffold):
- Playwright was removed entirely after the local Chromium download repeatedly hung on this Windows host. The smoke gate is now a **Vitest + React Testing Library** component test, which the Week-5 spec explicitly allows ("component or Playwright").
- `frontend/package.json` — removed `@playwright/test` and the `test:e2e` script; added `test: vitest run`; added dev deps `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `@types/jsdom`.
- `frontend/vitest.config.mts` — **new**. jsdom env, `@/` and `@components/` aliases mirroring `tsconfig.json`, `pool: 'threads'` (forks pool hung on Windows under Vitest 4), `setupFiles: ['./tests/setup.ts']`, `include: ['tests/**/*.test.{ts,tsx}']`.
- `frontend/tests/setup.ts` — **new**. Wires `@testing-library/jest-dom/vitest` matchers and runs `cleanup()` after each test.
- `frontend/tests/beam-calculator.test.tsx` — **new**. Mocks the heavy collaborators (`ParticleCanvas`, `TopBar`, `Navbar`, `Footer`, `HUD`) and `recharts.ResponsiveContainer` so jsdom only renders the form and results panel; stubs global `fetch` to return the canonical centre-load payload; clicks `Solve` with default field values; asserts `Max deflection:` row contains `0.02743902…`. Also pins the request shape: `POST /api/beam-calc/solve?units=si` with `length_m=6`, `youngs_modulus_pa=2e11`, `load = { kind: 'point_load_centre', magnitude_n: 10000 }`.
- `frontend/src/app/api/beam-calc/solve/route.ts` — backend base URL normalization for deployment parity: if `BACKEND_BASE_URL` already ends with `/v1` (Vercel + OCI common case), do not prepend another `/v1`; if omitted, append `/v1` automatically. This aligns `beam-calc` with the shared backend helper contract and avoids accidental `/v1/v1/...` in production.
- `frontend/playwright.config.ts` — **deleted**.
- `frontend/tests/beam-calculator.spec.ts` — **deleted**.

Operational note discovered during this session:
- `backend/.env` had duplicate entries and the **last** values won (`REQUIRE_DATABASE=true` + Postgres `DATABASE_URL`), causing backend startup failure when Postgres wasn't running.
- For local no-DB runs, ensure the final `.env` values are:
  - `REQUIRE_DATABASE=false`
  - `DATABASE_URL=`

### 2.6  Test status

```cmd
cd /d C:\tythys-com-cursor\backend
.venv\Scripts\python -m pytest tests\test_beam_calc.py tests\test_beam_calc_api.py -v
```

Last run (this session): **35 / 35 passed** in 1.15 s.
- 26 / 26 from the original `tests/test_beam_calc.py` gate (unchanged).
- 9 / 9 from the new `tests/test_beam_calc_api.py` integration suite.

The pre-existing backend smoke tests (`tests/test_smoke.py`,
`tests/test_hybrid_modes.py`) were not modified. They use `TestClient`
under `with` (which triggers the FastAPI lifespan) and therefore depend
on a reachable Postgres given the current `.env` defaults. The new
`test_beam_calc_api.py` patches `settings.database_url = None` at module
import time so the EngineerCalc HTTP gate runs offline.

### 2.6  Type / lint status

- TypeScript: edited files are lint-clean via IDE diagnostics for:
  - `frontend/src/app/api/beam-calc/solve/route.ts`
  - `frontend/src/app/beam-calculator/page.tsx`
  - `frontend/src/components/sections/Products.tsx`
  - `frontend/src/config/services.ts`
- Python: lints clean across `app/api/routes/beam_calc.py`, `app/main.py`, `app/services/beam_calc/types.py`, and `tests/test_beam_calc_api.py`. No warnings beyond the project-wide `pytest-asyncio` deprecation noise.
- Frontend smoke gate: `npm test` (Vitest) passes (`1 passed`).
- Frontend production build: `npm run build` passes on Next.js 16.2.4; route manifest includes `/beam-calculator` and `/api/beam-calc/solve`.
- Project note: `frontend/npm run lint` currently fails due to repository ESLint v9 flat-config migration (`eslint.config.*` missing). This is a repo-level configuration issue, not introduced by EngineerCalc wiring.

### 2.7  EngineerCalc Week 6 kickoff (this session, 2026-04-30)

Files added or edited:
- `frontend/src/app/pricing/page.tsx` — **new** pricing page for soft launch with Free / Pro / API tiers, week-6 copy, and waitlist CTA.
- `frontend/src/components/layout/Navbar.tsx` — added `Pricing` nav entry.
- `frontend/src/app/beam-calculator/page.tsx` — added soft-launch free-tier banner and PDF export watermark copy (`EngineerCalc Free Tier`) with upgrade pointer to `/pricing`.
- `docs/products/engineer-calc/04-week6-soft-launch.md` — **new** runbook: launch envelope, env parity checklist for Vercel/OCI, post-deploy smoke sequence, rollback checks, and first-5-user interview script.

### 2.8  Security/Auth/SEO/Admin hardening pass (this session, 2026-04-30)

Implemented:
- Google auth via Auth.js v5 with JWT session strategy and admin allowlist (`ADMIN_EMAILS`) in `frontend/src/lib/auth.ts`.
- Next.js auth route at `frontend/src/app/api/auth/[...nextauth]/route.ts`.
- Next 16 edge guard migrated to `frontend/src/proxy.ts` (replaces deprecated `middleware.ts`) protecting `/admin/*`.
- New canonical sign-in page at `frontend/src/app/auth/signin/page.tsx`; legacy `/auth/login`, `/auth/signup`, `/auth/forgot-password` now redirect to `/auth/signin` and are `noindex`.
- Admin-only analytics page at `frontend/src/app/admin/analytics/page.tsx` with server-side gate in `frontend/src/app/admin/layout.tsx`.
- Site-wide analytics via `@vercel/analytics` in `frontend/src/app/layout.tsx`.
- SEO file conventions added:
  - `frontend/src/app/robots.ts`
  - `frontend/src/app/sitemap.ts`
  - `frontend/src/app/manifest.ts`
  - `frontend/src/app/opengraph-image.tsx`
  - `frontend/src/app/twitter-image.tsx`
  - `frontend/src/components/seo/JsonLd.tsx` (Organization + WebSite + SoftwareApplication schema)
- Per-route metadata layouts added for:
  - `/beam-calculator`
  - `/pricing`
  - `/gateway-observability`
  - `/auth/*` (`noindex`)
  - `/admin/*` (`noindex`)
- Contact form bot protection + route hardening:
  - Cloudflare Turnstile widget in `frontend/src/components/sections/Contact.tsx`
  - honeypot field + submit gating
  - zod validation + Turnstile verification + origin checks + per-IP rate limiting in `frontend/src/app/api/contact/route.ts`
- Security utility layer added in `frontend/src/lib/security/*` (`rateLimit`, `verifyTurnstile`, `validate`, `csrf`, `withAuth`).
- Security headers/CSP/CORS allowlist in `frontend/next.config.js` (removed wildcard CORS).
- Added API hardening tests in `frontend/tests/contact-api.test.ts`.

### 2.9  Brand favicon, Apple touch icon & cross-route nav (2026-05-01)

**Goal:** visible favicon in browser tabs; iOS home-screen icon; navbar/footer links to
landing sections must work from **any** route (e.g. `/beam-calculator`), not only on `/`.

Files added or edited:
- `frontend/src/app/icon.svg` — static SVG favicon (gradient tile + `T` monogram, aligned with `BrandGlyph`).
- `frontend/src/app/apple-icon.tsx` — edge `ImageResponse` route **`/apple-icon`** (180×180 PNG) for Apple touch / PWA.
- `frontend/src/app/layout.tsx` — `metadata.icons` lists `/icon.svg` and Apple `/apple-icon`; root layout unchanged otherwise.
- `frontend/src/app/manifest.ts` — manifest icons: `/icon.svg` + `/apple-icon` (replaces obsolete `/favicon.ico` reference).
- `frontend/src/components/layout/LandingSectionLink.tsx` — client `Link` to `/#section`; when already on `/`, smooth-scroll + `replaceState` hash (offset ~96px under fixed chrome).
- `frontend/src/components/layout/HashScrollHandler.tsx` — mounted in root layout; on navigate to `/` with hash, scrolls target section after paint.
- `frontend/src/components/layout/Navbar.tsx` — Pillars / Products / Approach / About / Contact / Get in Touch use landing links + `/pricing` route.
- `frontend/src/components/layout/Footer.tsx` — wordmark is `<Link href="/">` (was `href="#"`).
- `frontend/src/components/sections/Hero.tsx` — primary CTAs use `LandingSectionLink`.
- `frontend/src/components/sections/Products.tsx` — contact/pricing links use `LandingSectionLink` for `contact`.

Related commits (recent `main`): … `580c6ed` (handoff §2.9/§2.10 snapshot), `1a5375f`, `d874e7e` (Apple icon), `7bdfd73` (favicon + nav), `f795135`, … see `git log`.

### 2.10  SEO audit — parked improvements (conversation 2026-05-01, **not implemented**)

Optional follow-ups when resuming marketing/SEO work:
- Remove or replace misleading **`SearchAction`** in `frontend/src/components/seo/JsonLd.tsx` (`/?q=` has no real site search).
- Populate **`Organization.sameAs`** or omit empty array when social URLs exist.
- Optionally route-specific OG images for `/beam-calculator` and `/pricing` (CTR).
- Confirm apex vs `www` redirect + `NEXT_PUBLIC_SITE_URL` parity in Vercel/DNS.

### 2.11  Product storytelling & GatewaySight GTM (conversation 2026-05-01, **no code churn**)

**Explored in chat (for onboarding / resumes):**

- **Menu “Pillars”** — navigates to the home-page `#pillars` block; the four pillars are the operating story; products declare which pillars they exercise via `services.ts`.
- **Live catalogue** — three `status: 'live'` entries in `frontend/src/config/services.ts`: **GatewaySight** (`/gateway-observability`), **EngineerCalc** (`/beam-calculator`), **Custom Models** (contact CTA `#contact`); all others are **Coming Soon**.
- **GatewaySight ↔ pillars** — narratively: *quantitative reasoning* (trustworthy gateway metrics) + *problem-solving + software* (insights packaged for operators). Not tagged with modeling / scientific-thinking in data; expand story only if positioning changes.

**Captured for sales:**

- Full prospect pitch + timed demo flow → `docs/sales/gatewaysight-prospect-brief.md`  
  (Use that file for demos; update it when the `/gateway-observability` UI or positioning shifts.)

---

## 3. The 6-week EngineerCalc ship plan (where we are)

| Week | Status | Deliverable |
|---|---|---|
| 1 | **DONE** | Spec + `01-physics.md` curriculum + Python skeleton + failing TDD tests. |
| 2 | **DONE** (compressed into Week 1) | Implement the four load cases until every Roark test is green. (Achieved on first compile because formulas were derived against the docs.) |
| 3 | **DONE** (this session, 2026-04-29) | `POST /v1/beam-calc/solve` with edge-side SI ↔ Imperial conversion; 9 `TestClient` integration tests pinned to the same Roark reference values as the kernel tests; Next.js proxy at `/api/beam-calc/solve`; learnings doc `02-learnings.md`. |
| 4 | **DONE** (this session, 2026-04-29) | `/beam-calculator` page added and wired end-to-end to `/api/beam-calc/solve`, with SI/Imperial toggle and three live charts (deflection/moment/shear). |
| 5 | **DONE** (2026-04-30) | Section library (`custom`/`rectangle`/`circle`/starter `w_shape`), deterministic PDF export, inline 422 field validation, Vitest component smoke gate, and backend-base normalization for Vercel/OCI parity. |
| 6 | **IN PROGRESS** (deploy verified 2026-05-01; product polish through `580c6ed` on `main`) | Soft launch + hardening deployed. UX polish: favicon, Apple touch icon, cross-route landing nav (§2.9). Handoff/GTM docs may be ahead of last deploy — see `git log`. Still owed: secret rotation (optional hygiene), browser OAuth/admin/Turnstile checks, first 5 interviews. **Extension paused** until explicit go — see §4. |

Read `docs/products/engineer-calc/00-spec.md` for the full week-by-week
table including monetisation tiers and success gates.

---

## 4. Next Task (resume exactly from here)

**Stance:** Application **extension is paused.** Do not start new product surfaces or scope
until the human explicitly unpauses. Keep all existing files and subsystems maintained.

**Week 6 — still owed when you resume:** finish soft-launch validation and the user-feedback loop.

What is *already done* (deploy verified 2026-05-01; re-verify after any new push):

- Vercel environment variables for `AUTH_*`, `NEXTAUTH_URL`, `ADMIN_EMAILS`,
  `NEXT_PUBLIC_SITE_URL`, `ALLOWED_ORIGINS`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`,
  `TURNSTILE_SECRET_KEY`, `BACKEND_BASE_URL` are in place — confirmed by
  the live behaviour below.
- Hardening commit `2b88a9c` and the redaction commit `6fd31dd` are live on
  `https://tythys.com`.
- Live smoke (CLI-checkable):
  - `GET /robots.txt` → `200 OK`
  - `GET /sitemap.xml` → `200 OK`
  - `GET /manifest.webmanifest` → `200 OK`
  - `GET /icon.svg` → `200 OK` (favicon)
  - `GET /apple-icon` → dynamic PNG `200 OK` (Apple touch)
  - `GET /auth/signin` → `200 OK`, `X-Robots-Tag: noindex, nofollow, noarchive`
  - `GET /admin/analytics` (unauth) → `307 → /auth/signin?from=%2Fadmin%2Fanalytics` (proxy auth gate works)
  - `POST /api/beam-calc/solve` → returns Roark deflection `0.027439…`
  - OCI `/health` → healthy
- All responses carry the expected security headers: HSTS w/ preload,
  full CSP allow-listing Google + Cloudflare Turnstile, `X-Frame-Options: DENY`,
  `X-Content-Type-Options: nosniff`, locked-down `Permissions-Policy`.

What is *still owed* (cannot be done from CLI):

1. **Rotate exposed secrets (do this first).**
   - During the previous chat, real values for `AUTH_SECRET`,
     `AUTH_GOOGLE_SECRET`, and `TURNSTILE_SECRET_KEY` were pasted into
     the working tree (and into chat). They were never committed — the
     redaction commit `6fd31dd` reverted the file before any push — but
     they should still be regenerated on principle:
     - new `AUTH_SECRET` (`openssl rand -base64 32`),
     - new Google OAuth client secret (rotate in Google Cloud Console),
     - new Turnstile secret key (rotate in Cloudflare dashboard).
   - Update Vercel env vars with the new values, redeploy.

2. **Browser-driven auth + admin-gate validation.**
   - Sign in via Google at `https://tythys.com/auth/signin` as
     `sd@tythys.com` → confirm `/admin/analytics` renders.
   - Sign in with a non-allowlisted Google account → confirm
     `/admin/analytics` is blocked (should redirect or 403, not render).

3. **Browser-driven contact anti-bot validation.**
   - Submit contact form *without* completing Turnstile → expect rejection.
   - Submit contact form *with* a valid Turnstile token → expect success.
   - Submit a payload with the hidden honeypot field populated → expect
     silent discard server-side (no error to the bot, no email to you).

4. **First 5 user interviews.**
   - Use the script in `docs/products/engineer-calc/04-week6-soft-launch.md`.
   - Capture friction on: units (SI vs Imperial), section presets, PDF
     export clarity, plot legibility, error messaging.
   - File the raw notes under `docs/products/engineer-calc/interviews/`
     (one markdown file per interview).

---

## 5. Local Run (CMD)

### Quick start
```cmd
cd /d C:\tythys-com-cursor
start-dev.cmd
```

### Manual start
Backend:
```cmd
cd /d C:\tythys-com-cursor\backend
.venv\Scripts\python -m uvicorn app.main:app --host 0.0.0.0 --port 8080
```

Frontend:
```cmd
cd /d C:\tythys-com-cursor\frontend
rmdir /s /q .next
npm run dev
```

### Run the EngineerCalc test suite (this is the gate)
```cmd
cd /d C:\tythys-com-cursor\backend
.venv\Scripts\python -m pytest tests\test_beam_calc.py tests\test_beam_calc_api.py -v
```

Expected output: `35 passed` (26 unit + 9 integration). If anything
fails, **do not move on to Week 5** — fix it first.

### Run the frontend smoke gate (Vitest)
```cmd
cd /d C:\tythys-com-cursor\frontend
npm test
```

Expected output: `Test Files  2 passed (2)` / `Tests  4 passed (4)`.
- `tests/beam-calculator.test.tsx` keeps the canonical centre-load smoke assertion.
- `tests/contact-api.test.ts` covers origin-reject, missing-turnstile reject, and honeypot discard behavior.

NOTE: Playwright was intentionally removed on 2026-04-30 — its local
Chromium download hung on this Windows host. Do not reintroduce
`@playwright/test` without an explicit decision; the current gate is
component-level and runs in ~3s.

### Hit the new HTTP endpoint manually (CMD)
```cmd
curl -X POST http://localhost:8080/v1/beam-calc/solve ^
  -H "Content-Type: application/json" ^
  -d "{\"length_m\":6.0,\"material\":{\"name\":\"Steel A36\",\"youngs_modulus_pa\":200e9},\"section\":{\"shape\":\"custom\",\"second_moment_m4\":8.2e-6,\"label\":\"Test\"},\"load\":{\"kind\":\"point_load_centre\",\"magnitude_n\":10000.0},\"sample_points\":51}"
```
`max_deflection_m` should be `0.02743902439024390`.

Frontend proxy (with the dev server running on `:3000`):
```cmd
curl -X POST http://localhost:3000/api/beam-calc/solve ^
  -H "Content-Type: application/json" ^
  -d "{\"length_m\":6.0,\"material\":{\"name\":\"Steel A36\",\"youngs_modulus_pa\":200e9},\"section\":{\"shape\":\"custom\",\"second_moment_m4\":8.2e-6,\"label\":\"Test\"},\"load\":{\"kind\":\"point_load_centre\",\"magnitude_n\":10000.0},\"sample_points\":51}"
```
Same number wrapped in `{"ok":true,"data":{...}}`.

### Run the independent reference verifier
```cmd
cd /d C:\tythys-com-cursor\backend
.venv\Scripts\python scripts\verify_beam_refs.py
```

Expected output:
```
  centre load   δ_max = 0.027439024390243903
  full-span UDL δ_max = 0.05144817073170733
  offset load   δ_max = 0.023324199615823056
  end moment    δ_max = 0.005632685553069521
```

If those numbers ever drift, the test suite must drift in the same way
or one of the two paths is wrong.

---

## 6. Verification (existing API Revenue Guard endpoints)

Still alive and untouched. Useful for confirming nothing regressed.

```cmd
curl http://localhost:8080/health
curl http://localhost:8080/v1/services/api-gateway-observability/summary
curl -X POST http://localhost:8080/v1/ingest/events ^
  -H "Content-Type: application/json" ^
  -H "x-api-key: dev-ingest-key" ^
  -d "{\"service_id\":\"api-gateway-observability\",\"events\":[{\"request_id\":\"req-1\",\"route\":\"/checkout\",\"status\":200,\"latency_ms\":38,\"bytes_sent\":1024,\"timestamp\":\"2026-04-25T12:00:00Z\",\"tenant\":\"demo-tenant\"}]}"
curl http://localhost:8080/v1/ingest/events/latest -H "x-api-key: dev-ingest-key"
```

Frontend proxy:
```cmd
curl http://localhost:3000/api/services/api-gateway-observability
curl http://localhost:3000/api/ingest/latest
```

One-time cleanup if anything looks inconsistent:
```cmd
taskkill /F /IM node.exe
taskkill /F /IM python.exe
```

---

## 7. Decisions locked

- **Four pillars** (`Quantitative Reasoning · Modeling · Scientific Thinking · Problem-Solving + Software`) are the operating spine. Every future product gets a `pillars: [...]` array in `services.ts` or it doesn't ship.
- **Build-to-learn** is the methodology. Curricula are encoded as physics docs sitting next to the code that implements them (`docs/products/<product>/01-physics.md` style).
- **Validation first**: every numeric output has a textbook reference test. Tests and an independent verifier script are both green before a product flips to "live".
- **CMD-first** for local development.
- Site is **`tythys.com`**; the workspace stays at `c:\tythys-com-cursor`.
- **Deployment baseline**: frontend is already connected/running on **Vercel**; backend deploy target is **OCI**; UI calls backend via Next.js API routes/proxy.
- Earlier API Revenue Guard work is **preserved**, not deleted. It remains part of the Tythys catalogue (`/gateway-observability`).

---

## 8. Resume prompt (approved)

Use this exactly in a new chat:

```text
Resume project at c:\tythys-com-cursor.
Read first:
- c:\tythys-com-cursor\docs\SESSION_HANDOFF.md
- c:\tythys-com-cursor\docs\sales\gatewaysight-prospect-brief.md *(prospect pitch + demo flow — optional unless GTM work)*
- c:\tythys-com-cursor\docs\products\engineer-calc\00-spec.md
- c:\tythys-com-cursor\docs\products\engineer-calc\01-physics.md
- c:\tythys-com-cursor\docs\products\engineer-calc\02-learnings.md
- c:\tythys-com-cursor\docs\products\engineer-calc\04-week6-soft-launch.md
Then continue from "Next Task" exactly (paused extension — Week 6 remaining: secret rotation optional hygiene, browser-driven OAuth/admin/Turnstile validation, first-5-user interviews; optional SEO items in §2.10; GatewaySight GTM: see SESSION_HANDOFF §2.11 and `docs/sales/gatewaysight-prospect-brief.md`. Production hardening + favicon/nav/Apple icon commits are on `main` — redeploy Vercel and smoke-test `/icon.svg`, `/apple-icon` after pull.)
Local CMD instructions only.
Keep all files maintained — including the preserved API Revenue Guard subsystems.
Preserve the four-pillar UI direction and the build-to-learn methodology.
Run `python -m pytest tests\test_beam_calc.py tests\test_beam_calc_api.py -v` from C:\tythys-com-cursor\backend before any new work — it must report 35 passed.
Also run `npm test` from C:\tythys-com-cursor\frontend — Vitest must report 2 passed (2) and 4 passed (4).
Then run `npm run build` from C:\tythys-com-cursor\frontend — production build must be green before deployment steps.
```

---

## 9. Session-close checklist (for the human, before exit)

- [x] Commit Week-3 + Week-4 + Week-5 changes created: `3af08a2  Complete EngineerCalc Week 5 polish: section presets, PDF export, inline validation, and Vitest smoke gate`.
- [x] All 35 EngineerCalc backend tests green (26 unit + 9 integration).
- [x] Frontend Vitest gate green (`2 passed`, `4 tests`): `cd /d C:\tythys-com-cursor\frontend && npm test`.
- [x] Frontend production build green: `cd /d C:\tythys-com-cursor\frontend && npm run build`.
- [x] TypeScript clean across all edited files.
- [x] Lints clean across all edited frontend + backend files.
- [ ] Working tree has local leftovers to triage before next commit: `frontend/next-env.d.ts` (generated) and untracked `notes-how-to-run-on-oci.md` (user notes draft). Keep/delete by explicit choice; do not auto-remove.
- [x] No destructive deletions of product code; legacy API Revenue Guard subsystems preserved (`/v1/services/...`, `/v1/ingest/...`, `/v1/incidents/...` all still mounted). Playwright tooling deleted by design — see §2.5.
- [x] This handoff updated with Week-6 security/auth/SEO/admin hardening completion + deployment rollout checklist + resume target.
- [x] (2026-05-01) Hardening commit `2b88a9c` pushed to `origin/main` and auto-deployed by Vercel. Live SEO/auth/security smoke verified via CLI (see §4 "What is already done"). Browser-side OAuth, admin allowlist, and Turnstile flows still owed by the human.
- [x] (2026-05-01) `creating-creds.md` rewritten with placeholder values (commit `6fd31dd`); real secrets never reached `origin`. Strongly recommend rotating `AUTH_SECRET`, `AUTH_GOOGLE_SECRET`, and `TURNSTILE_SECRET_KEY` regardless before next push to lock in the safety property.
- [x] (2026-05-01) **Session close:** Handoff refreshed; favicon (`icon.svg`), Apple touch route (`apple-icon.tsx`), cross-route landing nav (`LandingSectionLink`, `HashScrollHandler`), Footer home link — on `main` at `1a5375f`. Working tree clean (`main...origin/main`). Optional SEO tidy-ups documented in §2.10 (not coded).
- [x] (2026-05-01) **Session close (evening):** Cursor-exit handoff: `docs/SESSION_HANDOFF.md` refreshed; `docs/sales/gatewaysight-prospect-brief.md` added; §2.11 summarizes pillars / live products / GatewaySight GTM from chat. **`main` is 1 commit ahead of `origin/main`** (doc-only) until you `git push`.
- [ ] **Paused:** No new application extension until explicitly resumed — preserve API Revenue Guard routes, four-pillar UI, EngineerCalc tests/build gates.

═══════════════════════════════════════════════════════════════════════
                        PRIOR CONTEXT
        (preserved verbatim from earlier sessions for traceability)
═══════════════════════════════════════════════════════════════════════

The content below documents the API-Revenue-Guard workstream that was
active prior to the 2026-04-28 pivot. The code is still in the repo and
the endpoints listed here still respond. Keep this section as a living
reference — do not delete unless every subsystem it describes has been
formally retired.

## Project Goal (earlier framing)

Build **API Revenue Guard** as an industry-grade, production-ready control plane for API businesses:
- detect anomalies/incidents
- estimate business impact
- prioritize actions

## Current State (as of 2026-04-26)

### Backend (`c:\tythys-com-cursor\backend`)

Implemented:
- FastAPI service skeleton
- `GET /health`
- `GET /v1/services/{serviceId}/summary`
- `POST /v1/ingest/events`
- `GET /v1/ingest/events/latest`
- ingest payload schema validation
- mock API key guard for ingest routes
- in-memory ingest event store for rapid validation
- DB-aware ingest/auth wiring present in current backend routes and services
- service summaries for:
  - `api-gateway-observability`
  - `anomaly-lens`

Key files:
- `backend/app/main.py`
- `backend/app/api/routes/health.py`
- `backend/app/api/routes/services.py`
- `backend/app/api/routes/ingest.py`
- `backend/app/services/summary_service.py`
- `backend/app/services/ingest_service.py`
- `backend/app/services/auth_api_key.py`
- `backend/app/schemas/service_summary.py`
- `backend/app/schemas/ingest.py`
- `backend/app/core/config.py`
- `backend/requirements.txt`

### Frontend (`c:\tythys-com-cursor\frontend`)

Implemented:
- Next.js app scaffold
- app shell layout (sidebar, topbar, footer)
- styling foundation ported toward `C:\tythys-com\front_end` look and feel (theme + typography + glass surfaces)
- overview dashboard wired to backend summary API
- overview ingestion status card wired to backend ingest latest API
- copy realignment pass applied for API Revenue Guard messaging (hero/nav/cards/footer text)
- backend-aligned frontend API routes confirmed:
  - `/api/services/[serviceId]`
  - `/api/ingest/latest`
  - `/api/incidents/current`
  - `/api/endpoints/health`
  - `/api/actions/prioritized`
  - `/api/timeline`
- `observability-control-center` compatibility fixes applied for root Next build:
  - router updated to data router (`createBrowserRouter` + `RouterProvider`)
  - missing deps installed: `react-router-dom`, `recharts`, `vite`, `@vitejs/plugin-react`
  - TS import extension fix in `observability-control-center/src/main.tsx`
  - metrics env source switched from `import.meta.env` to `process.env`
- `npm run build` in `c:\tythys-com-cursor\frontend` verified successful after fixes
- extension module placeholders:
  - `/incidents`
  - `/endpoints`
  - `/timeline`
  - `/contact`
  - `/auth/login`
  - `/auth/signup`
  - `/auth/forgot-password`
- mock routes:
  - `/api/contact`
  - `/api/auth/login`
  - `/api/auth/google`
  - `/api/auth/signup`
  - `/api/auth/forgot-password`

Key files:
- `frontend/src/app/page.tsx`
- `frontend/src/app/globals.css`
- `frontend/src/components/layout/*`
- `frontend/src/config/modules.ts`
- `frontend/src/app/api/services/[serviceId]/route.ts`
- `frontend/src/app/api/ingest/latest/route.ts`
- `frontend/src/lib/backend.ts`

Recent caution:
- Multiple `next dev` instances caused inconsistent styling/behavior across ports (`3000`, `3001`, `3002`).
- Always run a single frontend dev process and hard refresh after restart.

### Docs (`c:\tythys-com-cursor\docs`)

- `PRODUCT_UI_ARCHITECTURE.md`
- `CUSTOMIZATION_AND_EXTENSION_GUIDE.md`
- `SESSION_HANDOFF.md` (this file)
- `products/engineer-calc/00-spec.md` *(added 2026-04-28)*
- `products/engineer-calc/01-physics.md` *(added 2026-04-28)*
- `sales/gatewaysight-prospect-brief.md` *(added 2026-05-01)*

## Earlier "Next Task" (superseded by §4 above)

Implement **Phase 3/4 backend completion** and corresponding frontend consumption:

1. Backend:
   - finish DB-first rollup/anomaly pipeline validation with seed + deterministic test fixtures
   - add `GET /v1/rollups/latest` debug endpoint (currently missing)
   - finalize incident lifecycle transitions (`open`, `acknowledged`, `resolved`)
   - wire impact snapshots persistence and retrieval
2. Frontend:
   - consume and render real incident/endpoint/action/timeline data on their dedicated pages
   - add incident preview block on overview (if absent in latest state)
   - keep current styling/theming direction; no redesign unless requested
3. Docs:
   - update `PRODUCT_UI_ARCHITECTURE.md`
   - update `CUSTOMIZATION_AND_EXTENSION_GUIDE.md`
   - update this `SESSION_HANDOFF.md` with new state and next task

This work item is parked, not abandoned. When EngineerCalc reaches its
soft-launch milestone (end of Week 6), revisit this list and decide which
parts are still worth completing for the gateway-observability product.
