"""Closed-form solutions for the four v0.1 load cases.

Every formula here corresponds to a section in
``docs/products/engineer-calc/01-physics.md`` and a reference test in
``backend/tests/test_beam_calc.py``. If you change a formula, the test
must already be green for the new behaviour.

All inputs and outputs are SI; see ``types.py`` docstring.
"""

from __future__ import annotations

import math
from dataclasses import dataclass


@dataclass(frozen=True)
class CaseResult:
    """Container the solver wraps in the public response schema."""

    reaction_left_n: float
    reaction_right_n: float
    max_bending_moment_nm: float
    max_bending_moment_at_m: float
    max_shear_n: float
    max_deflection_m: float
    max_deflection_at_m: float
    deflection_x: list[float]
    deflection_value: list[float]
    bending_moment_x: list[float]
    bending_moment_value: list[float]
    shear_x: list[float]
    shear_value: list[float]
    roark_reference: str


def _linspace(a: float, b: float, n: int) -> list[float]:
    """Evenly spaced sample points on [a, b], inclusive — like NumPy's linspace,
    but with no NumPy dependency in the hot path."""
    if n < 2:
        raise ValueError("n must be ≥ 2 for linspace.")
    step = (b - a) / (n - 1)
    return [a + i * step for i in range(n)]


# ──────────────────────────────────────────────────────────────────────
#  Case 1 — Point load P at midspan
#  Roark's Formulas for Stress and Strain, 7e, Table 8.1, case 1e
# ──────────────────────────────────────────────────────────────────────


def solve_point_load_centre(
    *, length_m: float, ei_nm2: float, magnitude_n: float, sample_points: int = 201
) -> CaseResult:
    L = length_m
    EI = ei_nm2
    P = magnitude_n
    n = sample_points

    R = P / 2.0  # symmetric reactions

    M_max = P * L / 4.0  # at x = L/2
    delta_max = P * L**3 / (48.0 * EI)  # at x = L/2

    xs = _linspace(0.0, L, n)
    deflections = []
    moments = []
    shears = []
    for x in xs:
        # Mirror the derivation around midspan: use (L − x) on the right half.
        if x <= L / 2.0:
            xi = x
        else:
            xi = L - x

        # δ(ξ) = P·ξ / (48·EI) · (3·L² − 4·ξ²)
        delta = (P * xi) / (48.0 * EI) * (3.0 * L**2 - 4.0 * xi**2)

        # M(ξ) = (P/2) · ξ
        M = (P / 2.0) * xi

        # Shear flips sign at midspan
        V = R if x < L / 2.0 else (-R if x > L / 2.0 else 0.0)

        deflections.append(delta)
        moments.append(M)
        shears.append(V)

    return CaseResult(
        reaction_left_n=R,
        reaction_right_n=R,
        max_bending_moment_nm=M_max,
        max_bending_moment_at_m=L / 2.0,
        max_shear_n=R,
        max_deflection_m=delta_max,
        max_deflection_at_m=L / 2.0,
        deflection_x=xs,
        deflection_value=deflections,
        bending_moment_x=xs,
        bending_moment_value=moments,
        shear_x=xs,
        shear_value=shears,
        roark_reference="Roark 7e, Table 8.1, case 1e (simply-supported, centre point load)",
    )


# ──────────────────────────────────────────────────────────────────────
#  Case 2 — Point load P at distance a from the left support
#  Roark's Formulas for Stress and Strain, 7e, Table 8.1, case 1c
# ──────────────────────────────────────────────────────────────────────


def solve_point_load_arbitrary(
    *,
    length_m: float,
    ei_nm2: float,
    magnitude_n: float,
    position_m: float,
    sample_points: int = 201,
) -> CaseResult:
    L = length_m
    EI = ei_nm2
    P = magnitude_n
    a = position_m
    b = L - a
    n = sample_points

    if a < 0.0 or a > L:
        raise ValueError(f"Load position a={a} must satisfy 0 ≤ a ≤ L={L}.")

    R_A = P * b / L
    R_B = P * a / L

    M_max = P * a * b / L  # at x = a
    M_max_at = a

    # Max-deflection location depends on which side of midspan the load sits.
    # The Roark formula is derived assuming a ≤ b. If a > b, mirror.
    if a <= b:
        a_eff, b_eff = a, b
        mirrored = False
    else:
        a_eff, b_eff = b, a
        mirrored = True

    # Closed-form max deflection (and its location) for a ≤ b:
    #   x* = sqrt((L² − b²) / 3)              (measured from the LEFT support)
    #   δ_max = P · b · (L² − b²)^(3/2) / (9·√3 · L · EI)
    x_star_from_left = math.sqrt((L**2 - b_eff**2) / 3.0)
    delta_max = P * b_eff * (L**2 - b_eff**2) ** 1.5 / (9.0 * math.sqrt(3.0) * L * EI)

    # Mirror the location back to the original frame.
    delta_max_at = x_star_from_left if not mirrored else (L - x_star_from_left)

    xs = _linspace(0.0, L, n)
    deflections = []
    moments = []
    shears = []
    for x in xs:
        # Bending moment: piecewise linear, peak at x = a.
        if x <= a:
            M = R_A * x
            V = R_A
        else:
            M = R_A * x - P * (x - a)
            V = R_A - P

        # Deflection. Use the closed-form for the original (non-mirrored)
        # frame on each side of the load.
        #   For 0 ≤ x ≤ a:
        #       δ(x) = P·b·x · (L² − b² − x²) / (6·L·EI)
        #   For a ≤ x ≤ L:
        #       Use symmetry: substitute x → (L − x) and swap a ↔ b.
        if x <= a:
            delta = (P * b * x) * (L**2 - b**2 - x**2) / (6.0 * L * EI)
        else:
            x_prime = L - x
            delta = (P * a * x_prime) * (L**2 - a**2 - x_prime**2) / (6.0 * L * EI)

        deflections.append(delta)
        moments.append(M)
        shears.append(V)

    max_shear = max(abs(R_A), abs(R_B))

    return CaseResult(
        reaction_left_n=R_A,
        reaction_right_n=R_B,
        max_bending_moment_nm=M_max,
        max_bending_moment_at_m=M_max_at,
        max_shear_n=max_shear,
        max_deflection_m=delta_max,
        max_deflection_at_m=delta_max_at,
        deflection_x=xs,
        deflection_value=deflections,
        bending_moment_x=xs,
        bending_moment_value=moments,
        shear_x=xs,
        shear_value=shears,
        roark_reference="Roark 7e, Table 8.1, case 1c (simply-supported, arbitrary point load)",
    )


# ──────────────────────────────────────────────────────────────────────
#  Case 3 — Uniformly distributed load w over the full span
#  Roark's Formulas for Stress and Strain, 7e, Table 8.1, case 1d
# ──────────────────────────────────────────────────────────────────────


def solve_udl_full_span(
    *, length_m: float, ei_nm2: float, intensity_n_per_m: float, sample_points: int = 201
) -> CaseResult:
    L = length_m
    EI = ei_nm2
    w = intensity_n_per_m
    n = sample_points

    R = w * L / 2.0  # symmetric

    M_max = w * L**2 / 8.0  # at x = L/2
    delta_max = 5.0 * w * L**4 / (384.0 * EI)  # at x = L/2

    xs = _linspace(0.0, L, n)
    deflections = []
    moments = []
    shears = []
    for x in xs:
        # M(x) = (w·x / 2) · (L − x)
        M = (w * x / 2.0) * (L - x)

        # δ(x) = w·x / (24·EI) · (L³ − 2·L·x² + x³)
        delta = (w * x) / (24.0 * EI) * (L**3 - 2.0 * L * x**2 + x**3)

        # V(x) = w·L/2 − w·x   (zero at midspan, ±wL/2 at the supports)
        V = w * L / 2.0 - w * x

        deflections.append(delta)
        moments.append(M)
        shears.append(V)

    return CaseResult(
        reaction_left_n=R,
        reaction_right_n=R,
        max_bending_moment_nm=M_max,
        max_bending_moment_at_m=L / 2.0,
        max_shear_n=R,
        max_deflection_m=delta_max,
        max_deflection_at_m=L / 2.0,
        deflection_x=xs,
        deflection_value=deflections,
        bending_moment_x=xs,
        bending_moment_value=moments,
        shear_x=xs,
        shear_value=shears,
        roark_reference="Roark 7e, Table 8.1, case 1d (simply-supported, full-span UDL)",
    )


# ──────────────────────────────────────────────────────────────────────
#  Case 4 — End moment M0 applied at the LEFT support
#  Roark's Formulas for Stress and Strain, 7e, Table 8.1, case 1k variant
# ──────────────────────────────────────────────────────────────────────


def solve_end_moment(
    *, length_m: float, ei_nm2: float, moment_nm: float, sample_points: int = 201
) -> CaseResult:
    L = length_m
    EI = ei_nm2
    M0 = moment_nm
    n = sample_points

    # Statics: ΣM_A = 0  →  M0 + R_B · L = 0  →  R_B = −M0 / L
    # Then ΣF_y = 0  →  R_A = M0 / L (downward on the support, i.e. support pulls up).
    # In our "+up at supports" convention:
    R_A = M0 / L  # support pushes UP
    R_B = -M0 / L  # support pushes DOWN (right support ends up pulling)

    # M(x) = M0 · (1 − x/L)  →  max |M| = |M0| at x = 0
    M_max = abs(M0)
    M_max_at = 0.0

    # Max deflection magnitude at x* = L · (1 − 1/√3)
    sqrt3 = math.sqrt(3.0)
    x_star = L * (1.0 - 1.0 / sqrt3)
    delta_max = abs(M0) * L**2 / (9.0 * sqrt3 * EI)
    # Sign of δ_max follows sign(M0) under our +δ-down convention.
    if M0 < 0:
        delta_max = -delta_max

    xs = _linspace(0.0, L, n)
    deflections = []
    moments = []
    shears = []
    for x in xs:
        M = M0 * (1.0 - x / L)
        # δ(x) = M0·x / (6·L·EI) · (L − x) · (2L − x)
        delta = (M0 * x) / (6.0 * L * EI) * (L - x) * (2.0 * L - x)
        # Constant shear V = −M0/L along the span (the couple is reacted by the pair R_A, R_B).
        V = -M0 / L

        deflections.append(delta)
        moments.append(M)
        shears.append(V)

    return CaseResult(
        reaction_left_n=R_A,
        reaction_right_n=R_B,
        max_bending_moment_nm=M_max,
        max_bending_moment_at_m=M_max_at,
        max_shear_n=abs(M0) / L,
        max_deflection_m=delta_max,
        max_deflection_at_m=x_star,
        deflection_x=xs,
        deflection_value=deflections,
        bending_moment_x=xs,
        bending_moment_value=moments,
        shear_x=xs,
        shear_value=shears,
        roark_reference="Roark 7e, Table 8.1, case 1k (simply-supported, end couple at left)",
    )
