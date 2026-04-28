# EngineerCalc — Physics & Math (Week 1 Curriculum)

> This document is **both** the curriculum you study in Week 1 **and** the
> specification the code in `backend/app/services/beam_calc/` is written
> against. Every formula here has a corresponding test in
> `backend/tests/test_beam_calc.py`.

---

## 0. The mental model

A beam is a long, thin solid that carries loads transverse to its long axis.
"Long and thin" means we can collapse it to a 1-D line and ask, at every
point along that line, two questions:

1. How much does it deflect from straight?  →  `δ(x)`
2. How much internal bending moment does it carry?  →  `M(x)`

Everything else — shear, stress, reactions — falls out of those two.

---

## 1. The Euler–Bernoulli beam equation (where everything starts)

For a slender beam under transverse load `q(x)`, the deflection `δ(x)` of the
neutral axis satisfies a fourth-order ODE:

\[
\frac{d^{2}}{dx^{2}}\!\left(EI\,\frac{d^{2}\delta}{dx^{2}}\right) = q(x)
\]

For a prismatic beam (constant `E` and `I`) this collapses to:

\[
EI\,\frac{d^{4}\delta}{dx^{4}} = q(x)
\]

Where:

| Symbol | Meaning | SI unit |
|---|---|---|
| `E` | Young's modulus of the material | Pa = N/m² |
| `I` | Second moment of area of the cross-section | m⁴ |
| `δ(x)` | Deflection (positive downward in our convention) | m |
| `q(x)` | Distributed load (positive downward) | N/m |

The product `EI` is the **flexural rigidity** — the only material+section
property the equation cares about. Half of an engineer's intuition is just
"big `EI` → stiff beam".

### Why fourth order?

Each derivative has a physical meaning:

| Derivative | What it is | Sign convention |
|---|---|---|
| `δ(x)` | Deflection | + downward |
| `δ'(x) = θ(x)` | Slope (rotation) | rad |
| `EI · δ''(x) = M(x)` | Bending moment | + sagging |
| `EI · δ'''(x) = V(x)` | Shear force | + downward on left face |
| `EI · δ''''(x) = q(x)` | Distributed load | + downward |

So the beam equation is just **stacking five physical quantities** on top of
each other; the math is the bookkeeping.

### Boundary conditions

A 4th-order ODE needs 4 boundary conditions. For a **simply-supported beam**
of length `L` they are:

- At `x = 0`:  `δ = 0`,  `M = EI·δ'' = 0`  (pin: blocks deflection, free to rotate)
- At `x = L`:  `δ = 0`,  `M = EI·δ'' = 0`  (roller: same)

Four BCs. Four constants of integration. The system closes.

---

## 2. Sign conventions (lock these in once)

```
        ↓ downward = positive load
   ┌────●─────────────────────●────┐
   │    △                     ○    │
   │    │    R_A           R_B │    │     y, δ positive downward
   │    │                       │    │
   x = 0                      x = L
```

- **Coordinates:** `x` runs left-to-right along the beam. `y` (and so `δ`)
  is positive *downward*. Loads `P`, `w` positive downward.
- **Reactions:** `R_A` at the left support, `R_B` at the right, both positive
  upward (i.e. the support pushes the beam up).
- **Bending moment:** positive when it sags the beam (concave up in our
  downward-positive frame). This is the standard "sagging positive"
  structural convention.
- **Shear:** the internal shear `V(x)` on the left face of a cut is positive
  when it acts downward.

These conventions are baked into the test cases in §6.

---

## 3. The four load cases (closed-form solutions)

For each case we give, in order: the loading, the reactions, the bending
moment `M(x)` piecewise, the maximum bending moment, the maximum deflection,
and the **Roark reference** (Table 8.1 of *Roark's Formulas for Stress and
Strain*, 7th edition) used as our regression test.

### Case 1 — Point load `P` at midspan

```
            P ↓
            │
   △────────●────────○
   ↑                 ↑
   R_A              R_B
   |←─ L/2 ─→|←─ L/2 ─→|
```

- **Reactions:** `R_A = R_B = P/2`
- **Shear:** `V(x) = +P/2` for `0 < x < L/2`; `V(x) = −P/2` for `L/2 < x < L`
- **Bending moment:**
  - `M(x) = (P/2)·x` for `0 ≤ x ≤ L/2`
  - `M(x) = (P/2)·(L − x)` for `L/2 ≤ x ≤ L`
- **Maximum moment:** `M_max = P·L / 4` at `x = L/2`
- **Deflection (max, at midspan):**

\[
\delta_{\max} = \frac{P\,L^{3}}{48\,E\,I}
\]

- **Deflection curve** (for `0 ≤ x ≤ L/2`, mirror for the other half):

\[
\delta(x) = \frac{P\,x}{48\,E\,I}\,(3L^{2} - 4x^{2})
\]

- **Roark ref:** Table 8.1, case 1e.

---

### Case 2 — Point load `P` at distance `a` from the left support

Let `b = L − a`. WLOG assume `a ≤ b` (so the load is in the left half;
the calculator should normalise this internally so the formulas work either way).

```
                P ↓
                │
   △────────────●─────────────○
   ↑                          ↑
   R_A                       R_B
   |←─── a ───→|←──── b ────→|
   |←──────── L ────────────→|
```

- **Reactions:** `R_A = P·b / L`,  `R_B = P·a / L`
- **Bending moment:**
  - `M(x) = (P·b/L)·x` for `0 ≤ x ≤ a`
  - `M(x) = (P·a/L)·(L − x)` for `a ≤ x ≤ L`
- **Maximum moment:** `M_max = P·a·b / L` at `x = a`
- **Maximum deflection (NOT at midspan when `a ≠ L/2`):**
  occurs at `x* = √((L² − b²)/3)` and equals

\[
\delta_{\max} = \frac{P\,b\,(L^{2} - b^{2})^{3/2}}{9\sqrt{3}\,L\,E\,I}
\]

- **Deflection curve:**
  - For `0 ≤ x ≤ a`:  `δ(x) = P·b·x · (L² − b² − x²) / (6·L·EI)`
  - For `a ≤ x ≤ L`:  use symmetry trick — substitute `x → L − x`, swap `a ↔ b`.
- **Roark ref:** Table 8.1, case 1c.

---

### Case 3 — Uniformly distributed load `w` over the full span

`w` has units of N/m (force per unit length).

```
        ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓
   △───────────────────────○
   ↑                       ↑
   R_A                    R_B
   |←─────── L ───────────→|
```

- **Total load:** `W = w·L`
- **Reactions:** `R_A = R_B = w·L / 2`
- **Shear:** `V(x) = w·L/2 − w·x`
- **Bending moment:** `M(x) = (w·x/2)·(L − x)` — a parabola
- **Maximum moment:** `M_max = w·L² / 8` at `x = L/2`
- **Maximum deflection** (at midspan):

\[
\delta_{\max} = \frac{5\,w\,L^{4}}{384\,E\,I}
\]

- **Deflection curve:**

\[
\delta(x) = \frac{w\,x}{24\,E\,I}\,(L^{3} - 2L\,x^{2} + x^{3})
\]

- **Roark ref:** Table 8.1, case 1d.

---

### Case 4 — End moment `M₀` applied at the left support

```
   M₀ ↻
   △───────────────────────○
   ↑                       ↑
   R_A                    R_B
   |←─────── L ───────────→|
```

- **Reactions:** `R_A = M₀ / L` (downward),  `R_B = −M₀ / L` (upward into the beam,
  so the roller pulls down — in practice, this means the beam tries to lift
  off the right support; ensure the support is a "two-way" roller).
- **Bending moment:** `M(x) = M₀ · (1 − x/L)`
- **Maximum moment:** `M_max = M₀` at `x = 0`
- **Maximum deflection:** occurs at `x* = L · (1 − 1/√3) ≈ 0.4226·L`; magnitude

\[
\delta_{\max} = \frac{M_{0}\,L^{2}}{9\sqrt{3}\,E\,I}
\]

- **Deflection curve:**

\[
\delta(x) = \frac{M_{0}\,x}{6\,L\,E\,I}\,(L - x)\,(2L - x)
\]

- **Roark ref:** Table 8.1, case 1k (variant: end couple, simply supported).

---

## 4. Bending stress (the user-facing answer that matters)

Once we have `M_max` and a section, the maximum bending stress is:

\[
\sigma_{\max} = \frac{M_{\max} \cdot c}{I}
\]

where `c` is the distance from the neutral axis to the extreme fibre
(half the section depth, for symmetric sections). The result is what an
engineer compares to allowable stress, yield, etc.

For the v0.1 section library:

| Section | `I` | `c` | Notes |
|---|---|---|---|
| Rectangle, width `b`, height `h` | `b·h³ / 12` | `h/2` | Bending about the strong axis. |
| Solid circle, diameter `d` | `π·d⁴ / 64` | `d/2` | |
| W-shape (I-beam) | from AISC table | `d/2` | We embed a small JSON of common W-shapes. |

---

## 5. Validation discipline

Every closed-form answer above has a numeric reference test in
`backend/tests/test_beam_calc.py` with tolerance `1e-6` (relative).

The cycle:

1. Write the test first (red).
2. Implement the case (green).
3. Compare against an independent source — Roark, MIT OCW lecture notes,
   a published structural calculator — for a sanity benchmark.
4. Document what you learned in `02-learnings.md` (created in Week 2).

If a test ever flickers, the build breaks and we don't ship that day. The
correctness gate is non-negotiable; that's what makes the tool worth paying
for vs. the spreadsheet someone wrote in 2009.

---

## 6. A note on what you're really learning

By the end of Week 2, having built the four cases:

- You will have integrated a 4th-order ODE four times **by hand**, with
  boundary conditions, in four different load configurations.
- You will know, in your bones, what `EI` means and why doubling section
  depth gives 8× the stiffness.
- You will have validated against a textbook five+ times, which trains the
  reflex "if my answer disagrees with a published source, **I am wrong**."

That is roughly the first half of an A-level / first-year-engineering
mechanics course, internalised by writing code that has to actually work.
This is the learn-by-building loop, fully concrete.
