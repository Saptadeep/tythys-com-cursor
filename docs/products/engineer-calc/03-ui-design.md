# EngineerCalc UI Design Notes (Week 5)

This document captures the v0.1 UI conventions for `/beam-calculator` after the Week 5 polish pass.

## 1) Screen layout

- Left panel: input form (units, geometry, load case, solve/export actions).
- Right panel: numeric results, Roark reference string, and three charts.
- Empty state: explicit prompt to run a solve and choose either presets or custom `I + c`.

## 2) Section workflow

Supported section paths:

- `custom`: user enters `I` and optional `c`.
- `rectangle`: user enters `b` and `h`; UI computes `I = b*h^3/12` and `c = h/2`.
- `circle`: user enters `d`; UI computes `I = pi*d^4/64` and `c = d/2`.
- `w_shape`: user picks starter presets (W8x10, W10x22, W12x26).

Rules:

- Backend solver remains SI-core and unchanged.
- Section convenience calculations happen at the UI edge.
- W-shape presets are stored in imperial section properties and converted by UI when SI mode is selected.

## 3) Chart conventions

Charts shown in this order:

1. Deflection curve
2. Bending moment curve
3. Shear curve

Visual conventions:

- X axis = beam position along span.
- Y axis = quantity in active units.
- Colors stay stable per chart type for fast scanning.

## 4) Validation behavior

- Backend `422` payload drives inline field-level validation messages.
- Error rendering maps request paths (for example `body.length_m`) to user-facing labels.
- Global request failures still show in a top-level error line.

## 5) PDF export (v1)

- Export action is available after a successful solve.
- Output includes:
  - Inputs snapshot
  - Key outputs
  - Roark reference
  - Embedded SVG versions of all three charts
- Export path is deterministic print output (`window.print`) to let users "Save as PDF".

## 6) Unit suffix reference

- Length: `m` (SI), `ft` (imperial)
- Force: `N` (SI), `lbf` (imperial)
- Moment: `N·m` (SI), `lbf·ft` (imperial)
- Deflection: `m` (SI), `in` (imperial)
- Modulus / stress: `Pa` (SI), `psi` (imperial)
- Second moment: `m^4` (SI), `in^4` (imperial)
- Extreme fibre distance: `m` (SI), `in` (imperial)
- Flexural rigidity: `N·m^2` (SI), `lbf·in^2` (imperial)
