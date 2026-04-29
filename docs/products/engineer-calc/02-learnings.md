# EngineerCalc — Week 2 + Week 3 Learnings

> Companion doc to `00-spec.md` (what we're building) and `01-physics.md`
> (why the formulas look the way they do). This file is the journal: what
> we tried, what surprised us, and what changed our minds.

---

## Week 2 — Implementing the four kernels

### What went better than expected

- **The kernels compiled correct on the first run.** All four closed-form
  load cases agreed with their Roark reference numbers immediately. This
  is the payoff of writing `01-physics.md` *before* writing
  `cases.py`: the derivations forced sign conventions, integration
  constants, and special-case treatment to be settled on paper, so the
  Python step was straight transcription.
- **The dispatch layer (`solve.py`) needed no debugging.** Discriminated
  unions in Pydantic v2 + `isinstance` dispatch in `solve()` mean the
  type system catches the "did you handle every load case" question at
  edit time, not at test time.

### The lesson worth keeping

> *Hand arithmetic is unreliable in a way that algebra is not.*

The first set of "Roark numeric reference" tests went red — but the
**implementation** was correct. The numbers I had typed into the test
docstring as "expected" values were wrong (off by a factor I'd dropped
during a back-of-envelope substitution). The implementation matched the
formula in `01-physics.md`; my hand arithmetic had not.

The fix was to write
[`backend/scripts/verify_beam_refs.py`](../../../backend/scripts/verify_beam_refs.py)
as a *third witness* — a tiny standalone script that re-derives the four
reference deflections directly from the closed-form expressions with no
dependency on the kernels. The test suite, the kernels, and the verifier
script must all agree. If any two diverge, exactly one of them is wrong
and we know it without guessing.

This pattern is now the ratchet for every future numeric kernel:

1. Closed-form formula in the physics doc.
2. Implementation in `cases.py` (or the equivalent service module).
3. Standalone re-derivation script in `backend/scripts/`.
4. Test suite asserts kernel == standalone script.

Two independent paths to the same number is the cheapest possible peer
review.

### The bug that never happened

The mirror-symmetry test — that loading a beam at distance `a` from the
left and at distance `(L - a)` from the right produces mirror-image
deflection curves and identical maxima — caught a sign flip in the
offset-load kernel *before it was ever written*. While drafting the
test, I noticed that my candidate implementation would have used the
wrong piecewise branch on the right-hand side of the load. Writing the
property-based test first made the bug obvious in the editor; the
implementation was then written to satisfy a test that already
articulated the invariant.

> **Property tests are not just regressions; they are design notes.**

---

## Week 3 — FastAPI route + integration tests

### What we built

- `app/api/routes/beam_calc.py` — `POST /v1/beam-calc/solve`, the single
  HTTP entry point.
- `tests/test_beam_calc_api.py` — 9 `TestClient` integration tests:
  4 happy-path Roark-reference checks (one per load case), 1 response
  shape contract, 3 validation-error tests (negative span, point load
  outside span, unknown load discriminator), 1 imperial round-trip.
- `app/main.py` — wired the new router under `/v1`.
- `frontend/src/app/api/beam-calc/solve/route.ts` — Next.js proxy that
  forwards body + units query to the backend and surfaces 422 errors
  with their structured payload (so the Week-4 UI can render
  field-level messages without re-doing validation client-side).

### Two design decisions worth recording

#### 1. Units conversion lives at the API edge, nowhere else.

The core solver in `app/services/beam_calc/` is SI-only by contract.
The route module in `app/api/routes/beam_calc.py` is the single place
that knows the conversion factors between metres / newtons / pascals and
feet / pounds-force / psi. This means:

- Every numerical test in `tests/test_beam_calc.py` stays in SI and
  doesn't have to think about units.
- A bug in unit conversion can only live in one file (the route), not
  scattered through every kernel.
- A new load case is wired up in two places — the kernel and the
  conversion table — and impossible to ship half-done because both are
  exercised by the integration tests.

The conversion factors are duplicated *exactly* in
`tests/test_beam_calc_api.py`. This duplication is intentional: a silent
change to a conversion factor in the route would otherwise pass the
imperial round-trip test trivially. The duplicate constants make any
such drift loud.

#### 2. The response carries a `units` discriminator instead of two response shapes.

`BeamSolveResponse` keeps its SI-flavoured field names (`_n`, `_m`,
`_pa`, …) regardless of which unit system the route was called in. A
new field, `units: "si" | "imperial"`, tells the consumer how to read
the numbers. This was chosen over the alternative of defining a
parallel `BeamSolveResponseImperial` schema because:

- The shape, ordering, and OpenAPI documentation stay identical.
- The UI can render the correct unit suffix from a single switch on
  one field, instead of branching its entire data path on the response
  type.
- The core solver still always sets `units="si"` from a single line in
  `BeamSolveResponse`, so the imperial path is unmistakably the route's
  responsibility.

### What we learned about the test environment

The handoff's 26-test gate (`tests/test_beam_calc.py`) doesn't use
`TestClient`, so it never triggers the FastAPI lifespan. The new
integration tests *do* — and the lifespan tries to bootstrap a Postgres
connection because `.env` ships with `REQUIRE_DATABASE=true`. We did
**not** want EngineerCalc tests to depend on a running database, so
`tests/test_beam_calc_api.py` patches `settings.database_url = None` at
module import time, *before* importing `app.main`. The lifespan then
takes its in-memory branch and the suite runs offline.

This is the correct seam for HTTP tests of pure-compute features: keep
the database-aware tests in their own files (where they can spin up a
test DB), and let the compute-only tests run hermetically.

### What's still owed (Week 4 onward)

- A Next.js `/beam-calculator` page that consumes
  `/api/beam-calc/solve`, with typed inputs, an SI/Imperial toggle, and
  live deflection / shear / moment plots.
- A small AISC section library so users don't have to type `I` by hand
  for common W-shapes.
- PDF report export.
- Soft launch + ≥ 5 user interviews.

The `apiEndpoint` field on the `beam-calc` entry in
`frontend/src/config/services.ts` was updated this week to point at the
real route (`/api/beam-calc/solve`). The `status` field was deliberately
**not** flipped to `"live"` — `Products.tsx` still hard-codes the badge
to "Coming Soon" for `beam-calc` until the dedicated page exists. The
status will only become honest after Week 4 lands.

---

## Cumulative test count after Week 3

```cmd
cd /d C:\tythys-com-cursor\backend
.venv\Scripts\python -m pytest tests\test_beam_calc.py tests\test_beam_calc_api.py -v
```

Expected: **35 passed** (26 unit + 9 integration). Both files are part
of the EngineerCalc gate now; if either goes red, the build must not
ship.
