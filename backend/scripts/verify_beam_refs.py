"""Independently re-derive the four Roark numeric reference values used in
``backend/tests/test_beam_calc.py``.

This script does NOT import the ``beam_calc`` package — it computes from
the raw closed-form formulas in ``docs/products/engineer-calc/01-physics.md``.
That makes it a third, independent witness alongside (a) the test suite and
(b) the kernel implementation.

Usage:
    python backend/scripts/verify_beam_refs.py

If any printed value disagrees with the corresponding test_beam_calc.py
reference, *something has drifted* and shipping is blocked until it is
explained.
"""

from __future__ import annotations

import math


def main() -> None:
    E = 200e9            # Pa
    I = 8.2e-6           # m^4
    EI = E * I
    L = 6.0              # m

    P = 10_000.0         # N (centre and offset loads)
    a = 2.0              # m (offset)
    b = L - a
    w = 5_000.0          # N/m (UDL)
    M0 = 4_000.0         # N·m (end moment)

    centre = P * L**3 / (48.0 * EI)
    udl = 5.0 * w * L**4 / (384.0 * EI)
    offset = P * b * (L**2 - b**2) ** 1.5 / (9.0 * math.sqrt(3.0) * L * EI)
    end_moment = M0 * L**2 / (9.0 * math.sqrt(3.0) * EI)

    print(f"  centre load   δ_max = {centre!r}")
    print(f"  full-span UDL δ_max = {udl!r}")
    print(f"  offset load   δ_max = {offset!r}")
    print(f"  end moment    δ_max = {end_moment!r}")


if __name__ == "__main__":
    main()
