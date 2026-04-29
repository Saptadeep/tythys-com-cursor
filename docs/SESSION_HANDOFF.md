# SESSION HANDOFF

Last updated: 2026-04-29 (EngineerCalc Week 3 shipped — FastAPI route + integration tests)
Workspace root: `c:\tythys-com-cursor`
Instruction mode: CMD instructions only
Latest commit on `main`: `4ec3238  Math-physics-chem-focus-1st-pass` (Week-3 changes pending commit)

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

## 2. Current state of the codebase (2026-04-28)

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
- `frontend/src/config/services.ts` — `beam-calc.apiEndpoint` updated from the placeholder `/api/services/beam-calc` to the real `/api/beam-calc/solve`. `status` left as-is (Products.tsx still hard-codes the badge to "Coming Soon" for `beam-calc`); status will only become honest after Week 4 lands.
- `docs/products/engineer-calc/02-learnings.md` — **new**. Journal of Week-2 + Week-3 lessons.

### 2.4  Test status

```cmd
cd /d C:\tythys-com-cursor\backend
.venv\Scripts\python -m pytest tests\test_beam_calc.py tests\test_beam_calc_api.py -v
```

Last run (this session): **35 / 35 passed** in 1.20 s.
- 26 / 26 from the original `tests/test_beam_calc.py` gate (unchanged).
- 9 / 9 from the new `tests/test_beam_calc_api.py` integration suite.

The pre-existing backend smoke tests (`tests/test_smoke.py`,
`tests/test_hybrid_modes.py`) were not modified. They use `TestClient`
under `with` (which triggers the FastAPI lifespan) and therefore depend
on a reachable Postgres given the current `.env` defaults. The new
`test_beam_calc_api.py` patches `settings.database_url = None` at module
import time so the EngineerCalc HTTP gate runs offline.

### 2.5  Type / lint status

- TypeScript: clean across all edited files (frontend lints clean for `frontend/src/app/api/beam-calc/solve/route.ts` and `frontend/src/config/services.ts`).
- Python: lints clean across `app/api/routes/beam_calc.py`, `app/main.py`, `app/services/beam_calc/types.py`, and `tests/test_beam_calc_api.py`. No warnings beyond the project-wide `pytest-asyncio` deprecation noise.

---

## 3. The 6-week EngineerCalc ship plan (where we are)

| Week | Status | Deliverable |
|---|---|---|
| 1 | **DONE** | Spec + `01-physics.md` curriculum + Python skeleton + failing TDD tests. |
| 2 | **DONE** (compressed into Week 1) | Implement the four load cases until every Roark test is green. (Achieved on first compile because formulas were derived against the docs.) |
| 3 | **DONE** (this session, 2026-04-29) | `POST /v1/beam-calc/solve` with edge-side SI ↔ Imperial conversion; 9 `TestClient` integration tests pinned to the same Roark reference values as the kernel tests; Next.js proxy at `/api/beam-calc/solve`; learnings doc `02-learnings.md`. |
| 4 | **NEXT** | Build the `/beam-calculator` Next.js page: typed inputs, units toggle (SI / Imperial) wired to the `?units=imperial` query param, live deflection plot + bending-moment diagram + shear diagram. |
| 5 |  | Section library (rectangle, circle, W-shape from a small AISC JSON), PDF report export, error/edge-case polish. |
| 6 |  | Soft launch: pricing page, freemium gate, ≥ 5 user interviews, capture feedback loop. |

Read `docs/products/engineer-calc/00-spec.md` for the full week-by-week
table including monetisation tiers and success gates.

---

## 4. Next Task (resume exactly from here)

**Week 4 — Build the `/beam-calculator` Next.js page.**

Concretely:

1. **Page route** `frontend/src/app/beam-calculator/page.tsx`
   - Server component shell + a client component for the form & charts.
   - Match the visual language of `frontend/src/components/sections/Pillars.tsx` and `Products.tsx` (glass card on `bg-card`, `accent-dim` border, `font-display` headline, `eyebrow` label).
   - Dual-column layout above `lg`: inputs on the left, results on the right; stacked on small screens.

2. **Inputs (typed)**
   - Span (length) with SI / Imperial toggle (segmented control). The toggle drives the `?units=` query the proxy forwards.
   - Material picker — at minimum a "Custom (E)" option and 1–2 presets (Steel A36, Aluminium 6061). E shown in current units.
   - Section: "Custom (I, c)" only for now. (Library lands in Week 5.)
   - Load picker — discriminated select on the four kinds; conditional fields for each (`magnitude`, `position`, `intensity`, `moment`).
   - All numeric fields: `inputmode="decimal"`, `step` matched to the unit, helpful placeholder.
   - Submit button disabled until the request is structurally complete.

3. **Wire to the proxy**
   - `POST /api/beam-calc/solve?units=<si|imperial>` with the constructed body.
   - On 200 → render the results panel.
   - On 422 → use `detail` (the forwarded backend payload) to highlight the offending field and show its message inline.
   - On 5xx → show a top-of-form banner with the upstream message.

4. **Visualisation**
   - Use `recharts` (already in `frontend/package.json`) for three stacked line charts: deflection δ(x), bending moment M(x), shear V(x).
   - X-axis: position along the beam in current units.
   - Annotate `max_deflection_at_m`, `max_bending_moment_at_m`, and the support reactions on the relevant chart.
   - Include the `roark_reference` string and `flexural_rigidity_ei_nm2` in a small "verification" footer panel — that's the trust signal.

5. **Marketing card honesty**
   - When the page exists and renders successfully end-to-end against the backend, **then** flip `services.ts → beam-calc → status` to `'live'` and remove the hard-coded "Coming Soon" override in `frontend/src/components/sections/Products.tsx` (`badgeLabel = service.id === 'beam-calc' ? 'Coming Soon' : ...`).

6. **Tests**
   - Frontend: at least one component test (or Playwright smoke) that submits the canonical centre-load case (P=10 000 N, L=6 m, E=200 GPa, I=8.2e-6 m⁴) and asserts `δ_max ≈ 0.02743902439024390 m` shows up in the rendered output. The number is the same Roark reference pinned in `tests/test_beam_calc.py` and `tests/test_beam_calc_api.py`; if the UI ever drifts, all three layers should drift together or one of them is wrong.
   - Backend: no new tests required for Week 4. Re-run the Week-3 gate as the regression check.

7. **Docs**
   - Add `docs/products/engineer-calc/03-ui-design.md` with screenshots of the final page, the chart legend conventions, and the SI ↔ Imperial unit-suffix table the UI uses.
   - Update **this** `SESSION_HANDOFF.md` at end of Week 4 with the new state.

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
fails, **do not move on to Week 4** — fix it first.

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
- Earlier API Revenue Guard work is **preserved**, not deleted. It remains part of the Tythys catalogue (`/gateway-observability`).

---

## 8. Resume prompt (approved)

Use this exactly in a new chat:

```text
Resume project at c:\tythys-com-cursor.
Read first:
- c:\tythys-com-cursor\docs\SESSION_HANDOFF.md
- c:\tythys-com-cursor\docs\products\engineer-calc\00-spec.md
- c:\tythys-com-cursor\docs\products\engineer-calc\01-physics.md
- c:\tythys-com-cursor\docs\products\engineer-calc\02-learnings.md
Then continue from "Next Task" exactly (Week 4: build the /beam-calculator Next.js page wired to /api/beam-calc/solve).
Local CMD instructions only.
Keep all files maintained — including the preserved API Revenue Guard subsystems.
Preserve the four-pillar UI direction and the build-to-learn methodology.
Run `python -m pytest tests\test_beam_calc.py tests\test_beam_calc_api.py -v` from C:\tythys-com-cursor\backend before any new work — it must report 35 passed.
```

---

## 9. Session-close checklist (for the human, before exit)

- [ ] Commit Week-3 changes (this session is currently uncommitted; latest pushed commit is still `Math-physics-chem-focus-1st-pass`).
- [x] All 35 EngineerCalc tests green (26 unit + 9 integration).
- [x] TypeScript clean across all edited files.
- [x] Lints clean across all edited frontend + backend files.
- [x] No destructive deletions; legacy API Revenue Guard subsystems preserved (`/v1/services/...`, `/v1/ingest/...`, `/v1/incidents/...` all still mounted).
- [x] This handoff updated with the EngineerCalc Week-3 state + Week-4 next-task.

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
