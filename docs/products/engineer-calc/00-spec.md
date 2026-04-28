# EngineerCalc — Product Spec (v0.1)

> One-paragraph pitch.  
> EngineerCalc is a focused web tool that solves the four most common beam-loading
> problems for a simply-supported beam — point load at centre, point load at an
> arbitrary position, uniformly distributed load, and an end moment — and returns
> deflection, bending moment, shear, and reaction forces with a live visualisation.
> Outputs are validated against *Roark's Formulas for Stress and Strain* on every
> commit; nothing ships unless it agrees with the textbook.

---

## 1. Why this is the first product Tythys ships

| Pillar | How EngineerCalc exercises it |
|---|---|
| `Σ` Quantitative Reasoning | Units (SI / Imperial), order-of-magnitude sanity checks, allowable stress comparisons. |
| `∇` Modeling | Beam-as-ODE: derive each formula from Euler–Bernoulli, not copied from a chart. |
| `⚛` Scientific Thinking | Every closed-form result has a Roark reference test case. Disagree → don't ship. |
| `⟶` Problem-Solving + Software | Anyone who needs a number can get one in under 30 seconds, no MATLAB licence. |

It is also the cheapest, fastest, most honest way for a solo founder to learn
classical mechanics: the curriculum is the test suite.

---

## 2. Scope (v0.1 — what ships in 6 weeks)

### In scope

- **Beam type:** simply-supported (one pin, one roller). Single span. Prismatic.
- **Material:** linear-elastic, isotropic. User supplies `E` (Young's modulus).
- **Section:** user supplies `I` (second moment of area) directly OR picks from a
  small library: rectangle, circle, standard I-beam (W-shape).
- **Load cases:**
  1. Point load `P` at midspan
  2. Point load `P` at arbitrary position `a` from left support
  3. Uniformly distributed load `w` over the full span
  4. End moment `M₀` applied at one support
- **Outputs:**
  - Reaction forces `R_A`, `R_B`
  - Maximum bending moment `M_max` and its location
  - Maximum shear `V_max`
  - Maximum deflection `δ_max` and its location
  - Deflection `δ(x)` curve (sampled at 200 points)
  - Bending moment `M(x)` curve (sampled at 200 points)
  - Maximum bending stress `σ_max = M_max · c / I` (if section is selected)

### Out of scope (v0.1 — explicitly deferred)

- Cantilever, fixed-fixed, multi-span, or continuous beams
- Combined load cases (superposition is one click away but UX-deferred)
- Buckling, dynamic loading, fatigue, plastic hinges
- Code checks (AISC, Eurocode) — that's a v0.3 conversation
- 2D / 3D frame analysis, FEA — that's PhysicsSim, a different product

The discipline: **say no aggressively in v0.1**. Each "no" is a v0.2 customer interview.

---

## 3. Success criteria (the gates that decide if we ship)

| # | Gate | How we measure |
|---|---|---|
| G1 | Correctness | All Roark reference cases pass, all edge cases handled with explicit errors. `pytest` is green. |
| G2 | Speed | A solve completes in < 50 ms server-side for any input in the supported range. |
| G3 | UX | A first-time user can produce a correct deflection plot in < 60 seconds without reading docs. |
| G4 | Honesty | Every assumption (linear-elastic, small deflections, etc.) is visible in the UI, not buried. |
| G5 | Distribution | At least 5 real engineers / students have used it and given feedback. |

If any gate is red, we don't soft-launch. We fix.

---

## 4. Monetisation (the honest version)

- **Free tier:** unlimited solves, single load case at a time, watermark on PDF export.
- **Pro tier (target ~$9 / month):**
  - Combined load cases (superposition)
  - Section library + custom sections
  - Clean PDF report export, no watermark
  - History of past solves
- **API tier (target ~$49 / month):**
  - Programmatic access to `/v1/beam-calc/solve`
  - Higher rate limits
- **School licence:** flat fee for a department, all features.

We are explicit that free + pro tiers stay forever; we are not the kind of
vendor that holds engineering safety hostage to a subscription.

---

## 5. Risks (and what we're doing about them)

| Risk | Mitigation |
|---|---|
| The four load cases are too narrow to be useful. | They are textbook cases for a reason — 80% of intro statics homework + a surprising fraction of real preliminary sizing. v0.2 adds cantilever + UDL-on-cantilever. |
| Engineers won't trust an unknown calculator. | Every result links to its Roark reference. The validation suite is open-source. |
| Free tier cannibalises paid. | Pro features (combined loads, sections, PDF, history) are exactly what a working professional wants. Students who become engineers convert. |
| Solo-founder bus factor. | Code + tests + physics doc are version-controlled and self-explanatory. |

---

## 6. The 6-week plan

| Week | Deliverable |
|---|---|
| 1 | This spec + `01-physics.md` (the Euler–Bernoulli derivation + Roark reference cases) + Python skeleton + failing TDD tests. |
| 2 | Implement the four load cases until every Roark test is green. |
| 3 | Wrap the core in a FastAPI route `/v1/beam-calc/solve`, add request/response schemas, integration tests. |
| 4 | Build the `/beam-calculator` Next.js page: inputs, units toggle, live deflection + bending-moment plots. |
| 5 | Section library (rect, circle, W-shape), PDF report export, error/edge-case polish. |
| 6 | Soft launch: pricing page, freemium gate, 5 user interviews, capture feedback loop. |

---

## 7. North-star metric

**Number of correctness-validated solves shipped per week.** Not signups, not
pageviews. Every solve a user trusts their next decision on is the unit of
value we're producing.
