"""Validation suite for ``app.services.beam_calc``.

Every test asserts a closed-form result documented in
``docs/products/engineer-calc/01-physics.md`` and traceable to Roark's
*Formulas for Stress and Strain*, 7th edition, Table 8.1.

The structure is:

    1. Tests against the mathematical closed-form expressions
       (these are *unit* tests of the formulas themselves).
    2. Tests against numeric Roark reference values
       (these are *regression* tests pinned to the published table).
    3. Property-based / sanity tests
       (symmetry, sign conventions, units).
    4. Edge-case + error-handling tests.

If any test in this file goes red, the build must not ship.
"""

from __future__ import annotations

import math

import pytest

from app.services.beam_calc import (
    BeamMaterial,
    BeamSection,
    BeamSolveRequest,
    solve,
)
from app.services.beam_calc.cases import (
    solve_end_moment,
    solve_point_load_arbitrary,
    solve_point_load_centre,
    solve_udl_full_span,
)
from app.services.beam_calc.types import (
    EndMomentLeft,
    PointLoadArbitrary,
    PointLoadCentre,
    UdlFullSpan,
)

# ──────────────────────────────────────────────────────────────────────
#  Reference fixtures (a "typical" steel I-beam, all SI)
# ──────────────────────────────────────────────────────────────────────

E_STEEL = 200e9            # Pa
I_TYP = 8.2e-6             # m^4 (~ a small W6×12 ish)
EI = E_STEEL * I_TYP       # N·m^2
L = 6.0                    # m

REL_TOL = 1e-9
ABS_TOL = 1e-12


def _approx(value: float, expected: float, *, rel: float = REL_TOL, abs_: float = ABS_TOL) -> bool:
    return math.isclose(value, expected, rel_tol=rel, abs_tol=abs_)


# ══════════════════════════════════════════════════════════════════════
#  CASE 1 — Point load P at midspan
# ══════════════════════════════════════════════════════════════════════


class TestPointLoadCentre:
    P = 10_000.0  # N

    def test_max_deflection_matches_PL3_over_48EI(self) -> None:
        result = solve_point_load_centre(length_m=L, ei_nm2=EI, magnitude_n=self.P)
        expected = self.P * L**3 / (48.0 * EI)
        assert _approx(result.max_deflection_m, expected)
        assert _approx(result.max_deflection_at_m, L / 2.0)

    def test_max_moment_is_PL_over_4_at_midspan(self) -> None:
        result = solve_point_load_centre(length_m=L, ei_nm2=EI, magnitude_n=self.P)
        assert _approx(result.max_bending_moment_nm, self.P * L / 4.0)
        assert _approx(result.max_bending_moment_at_m, L / 2.0)

    def test_reactions_are_symmetric_each_half_load(self) -> None:
        result = solve_point_load_centre(length_m=L, ei_nm2=EI, magnitude_n=self.P)
        assert _approx(result.reaction_left_n, self.P / 2.0)
        assert _approx(result.reaction_right_n, self.P / 2.0)

    def test_deflection_is_zero_at_supports(self) -> None:
        result = solve_point_load_centre(length_m=L, ei_nm2=EI, magnitude_n=self.P)
        assert _approx(result.deflection_value[0], 0.0, abs_=1e-9)
        assert _approx(result.deflection_value[-1], 0.0, abs_=1e-9)

    def test_deflection_curve_is_symmetric_about_midspan(self) -> None:
        result = solve_point_load_centre(length_m=L, ei_nm2=EI, magnitude_n=self.P, sample_points=21)
        n = len(result.deflection_value)
        for i in range(n):
            assert _approx(result.deflection_value[i], result.deflection_value[n - 1 - i], abs_=1e-9)


# ══════════════════════════════════════════════════════════════════════
#  CASE 2 — Point load P at distance a from the LEFT support
# ══════════════════════════════════════════════════════════════════════


class TestPointLoadArbitrary:
    P = 10_000.0  # N

    def test_collapses_to_centre_case_when_a_is_half_L(self) -> None:
        a = L / 2.0
        result = solve_point_load_arbitrary(
            length_m=L, ei_nm2=EI, magnitude_n=self.P, position_m=a
        )
        expected_delta_max = self.P * L**3 / (48.0 * EI)
        # Tolerance loosened slightly — closed-form for arbitrary case has a
        # different algebraic path than the centre-only formula but should
        # still agree to engineering precision (here, < 1e-6 relative).
        assert _approx(result.max_deflection_m, expected_delta_max, rel=1e-6)
        assert _approx(result.max_bending_moment_nm, self.P * L / 4.0, rel=1e-9)
        assert _approx(result.max_bending_moment_at_m, L / 2.0, rel=1e-9)

    def test_reactions_obey_static_equilibrium(self) -> None:
        a = 2.0  # m, with L=6 → b=4
        result = solve_point_load_arbitrary(
            length_m=L, ei_nm2=EI, magnitude_n=self.P, position_m=a
        )
        b = L - a
        assert _approx(result.reaction_left_n, self.P * b / L)
        assert _approx(result.reaction_right_n, self.P * a / L)
        # ΣF_y = 0
        assert _approx(result.reaction_left_n + result.reaction_right_n, self.P, rel=1e-9)
        # M_max = P·a·b/L at x = a
        assert _approx(result.max_bending_moment_nm, self.P * a * b / L)
        assert _approx(result.max_bending_moment_at_m, a)

    def test_max_deflection_location_for_offset_load(self) -> None:
        # a < b: max deflection at x* = sqrt((L² − b²)/3), measured from LEFT.
        a = 2.0
        result = solve_point_load_arbitrary(
            length_m=L, ei_nm2=EI, magnitude_n=self.P, position_m=a
        )
        b = L - a
        x_star = math.sqrt((L**2 - b**2) / 3.0)
        delta_max_expected = self.P * b * (L**2 - b**2) ** 1.5 / (9.0 * math.sqrt(3.0) * L * EI)
        assert _approx(result.max_deflection_at_m, x_star, rel=1e-9)
        assert _approx(result.max_deflection_m, delta_max_expected, rel=1e-9)

    def test_mirror_symmetry_load_on_right_side(self) -> None:
        # Loads at a and (L−a) should produce mirror-image deflection curves
        # and identical maxima.
        a = 1.5
        left = solve_point_load_arbitrary(
            length_m=L, ei_nm2=EI, magnitude_n=self.P, position_m=a, sample_points=21
        )
        right = solve_point_load_arbitrary(
            length_m=L, ei_nm2=EI, magnitude_n=self.P, position_m=L - a, sample_points=21
        )
        assert _approx(left.max_deflection_m, right.max_deflection_m, rel=1e-9)
        assert _approx(left.reaction_left_n, right.reaction_right_n, rel=1e-9)
        # Curves mirror around midspan.
        n = len(left.deflection_value)
        for i in range(n):
            assert _approx(
                left.deflection_value[i], right.deflection_value[n - 1 - i], abs_=1e-9
            )

    def test_rejects_position_outside_span(self) -> None:
        with pytest.raises(ValueError):
            solve_point_load_arbitrary(
                length_m=L, ei_nm2=EI, magnitude_n=self.P, position_m=L + 1e-6
            )
        with pytest.raises(ValueError):
            solve_point_load_arbitrary(
                length_m=L, ei_nm2=EI, magnitude_n=self.P, position_m=-1e-6
            )


# ══════════════════════════════════════════════════════════════════════
#  CASE 3 — UDL w over the full span
# ══════════════════════════════════════════════════════════════════════


class TestUdlFullSpan:
    w = 5_000.0  # N/m

    def test_max_deflection_matches_5wL4_over_384EI(self) -> None:
        result = solve_udl_full_span(length_m=L, ei_nm2=EI, intensity_n_per_m=self.w)
        expected = 5.0 * self.w * L**4 / (384.0 * EI)
        assert _approx(result.max_deflection_m, expected)
        assert _approx(result.max_deflection_at_m, L / 2.0)

    def test_max_moment_is_wL2_over_8(self) -> None:
        result = solve_udl_full_span(length_m=L, ei_nm2=EI, intensity_n_per_m=self.w)
        assert _approx(result.max_bending_moment_nm, self.w * L**2 / 8.0)
        assert _approx(result.max_bending_moment_at_m, L / 2.0)

    def test_reactions_each_half_total_load(self) -> None:
        result = solve_udl_full_span(length_m=L, ei_nm2=EI, intensity_n_per_m=self.w)
        assert _approx(result.reaction_left_n, self.w * L / 2.0)
        assert _approx(result.reaction_right_n, self.w * L / 2.0)

    def test_shear_is_zero_at_midspan(self) -> None:
        result = solve_udl_full_span(
            length_m=L, ei_nm2=EI, intensity_n_per_m=self.w, sample_points=201
        )
        midspan_idx = (len(result.shear_value) - 1) // 2
        assert _approx(result.shear_value[midspan_idx], 0.0, abs_=1e-9)

    def test_deflection_is_zero_at_supports(self) -> None:
        result = solve_udl_full_span(length_m=L, ei_nm2=EI, intensity_n_per_m=self.w)
        assert _approx(result.deflection_value[0], 0.0, abs_=1e-9)
        assert _approx(result.deflection_value[-1], 0.0, abs_=1e-9)


# ══════════════════════════════════════════════════════════════════════
#  CASE 4 — End moment M0 at the LEFT support
# ══════════════════════════════════════════════════════════════════════


class TestEndMoment:
    M0 = 4_000.0  # N·m

    def test_max_moment_equals_applied_at_left_support(self) -> None:
        result = solve_end_moment(length_m=L, ei_nm2=EI, moment_nm=self.M0)
        assert _approx(result.max_bending_moment_nm, abs(self.M0))
        assert _approx(result.max_bending_moment_at_m, 0.0, abs_=1e-12)

    def test_max_deflection_location_is_L_times_one_minus_inv_root3(self) -> None:
        result = solve_end_moment(length_m=L, ei_nm2=EI, moment_nm=self.M0)
        x_star = L * (1.0 - 1.0 / math.sqrt(3.0))
        delta_max = self.M0 * L**2 / (9.0 * math.sqrt(3.0) * EI)
        assert _approx(result.max_deflection_at_m, x_star)
        assert _approx(result.max_deflection_m, delta_max)

    def test_reactions_form_a_couple(self) -> None:
        # A pure end couple is reacted by R_A = M0/L up, R_B = -M0/L (down).
        # Net vertical force on beam from supports is zero.
        result = solve_end_moment(length_m=L, ei_nm2=EI, moment_nm=self.M0)
        assert _approx(result.reaction_left_n, self.M0 / L)
        assert _approx(result.reaction_right_n, -self.M0 / L)
        assert _approx(result.reaction_left_n + result.reaction_right_n, 0.0, abs_=1e-9)


# ══════════════════════════════════════════════════════════════════════
#  Roark numeric regression — pinned values
#  (Anyone changing the kernels must also justify any change here.)
# ══════════════════════════════════════════════════════════════════════


class TestRoarkNumericReferences:
    """Hand-computed numeric checks. These are deliberately concrete numbers,
    not symbolic, so a change in the implementation that drifts the answer
    becomes loud and visible in CI."""

    # Reference values below were independently re-derived from the
    # closed-form formulas in 01-physics.md by direct substitution
    # (see backend/scripts/verify_beam_refs.py for the one-liner).
    # If a kernel ever drifts from these numbers, the formula it claims
    # to implement is no longer the formula it actually implements.

    def test_pll3_centre_load_reference_value(self) -> None:
        # δ = P·L³ / (48·EI)
        # = 10 000 · 6³ / (48 · 200e9 · 8.2e-6)
        # = 2 160 000 / 78 720 000  =  0.02743902439024390  m
        result = solve_point_load_centre(length_m=L, ei_nm2=EI, magnitude_n=10_000.0)
        assert math.isclose(result.max_deflection_m, 0.02743902439024390, rel_tol=1e-9)

    def test_5wl4_udl_reference_value(self) -> None:
        # δ = 5·w·L⁴ / (384·EI)
        # = 5 · 5 000 · 1 296 / (384 · 1.64e6)
        # = 32 400 000 / 629 760 000  =  0.05144817073170733  m
        result = solve_udl_full_span(length_m=L, ei_nm2=EI, intensity_n_per_m=5_000.0)
        assert math.isclose(result.max_deflection_m, 0.05144817073170733, rel_tol=1e-9)

    def test_offset_load_reference_value(self) -> None:
        # δ = P·b·(L²−b²)^1.5 / (9·√3·L·EI),  with a=2, b=4
        # = 10 000 · 4 · 20^1.5 / (9·√3 · 6 · 1.64e6)
        # = 3 577 708.7639996…  /  153 390 419.458…
        # =  0.023324199615823056  m
        result = solve_point_load_arbitrary(
            length_m=L, ei_nm2=EI, magnitude_n=10_000.0, position_m=2.0
        )
        assert math.isclose(result.max_deflection_m, 0.023324199615823056, rel_tol=1e-9)

    def test_end_moment_reference_value(self) -> None:
        # δ = M₀·L² / (9·√3·EI)
        # = 4 000 · 36 / (15.588457268… · 1.64e6)
        # = 144 000 / 25 565 069.92…   =  0.005632685553069521  m
        result = solve_end_moment(length_m=L, ei_nm2=EI, moment_nm=4_000.0)
        assert math.isclose(result.max_deflection_m, 0.005632685553069521, rel_tol=1e-9)


# ══════════════════════════════════════════════════════════════════════
#  Public solve() API — wraps the kernels into the response schema
# ══════════════════════════════════════════════════════════════════════


class TestPublicSolveAPI:
    def _request(self, load) -> BeamSolveRequest:
        return BeamSolveRequest(
            length_m=L,
            material=BeamMaterial(name="Steel A36", youngs_modulus_pa=E_STEEL),
            section=BeamSection(
                shape="custom",
                second_moment_m4=I_TYP,
                extreme_fibre_distance_m=0.075,  # arbitrary 75 mm half-depth
                label="Test section",
            ),
            load=load,
        )

    def test_centre_load_response_includes_stress_when_c_provided(self) -> None:
        req = self._request(PointLoadCentre(magnitude_n=10_000.0))
        resp = solve(req)
        # σ_max = M_max · c / I
        expected_stress = resp.max_bending_moment_nm * 0.075 / I_TYP
        assert resp.max_bending_stress_pa is not None
        assert math.isclose(resp.max_bending_stress_pa, expected_stress, rel_tol=1e-9)
        assert resp.flexural_rigidity_ei_nm2 == pytest.approx(EI)
        assert resp.span_m == pytest.approx(L)

    def test_udl_response_carries_curve_arrays_of_correct_length(self) -> None:
        req = self._request(UdlFullSpan(intensity_n_per_m=5_000.0))
        req.sample_points = 51
        resp = solve(req)
        assert len(resp.deflection_curve.x_m) == 51
        assert len(resp.deflection_curve.value) == 51
        assert len(resp.bending_moment_curve.value) == 51
        assert len(resp.shear_curve.value) == 51

    def test_arbitrary_load_position_validation(self) -> None:
        with pytest.raises(ValueError):
            BeamSolveRequest(
                length_m=L,
                material=BeamMaterial(name="Steel", youngs_modulus_pa=E_STEEL),
                section=BeamSection(shape="custom", second_moment_m4=I_TYP),
                load=PointLoadArbitrary(magnitude_n=1.0, position_m=L * 2),
            )

    def test_end_moment_solver_reaches_through_public_api(self) -> None:
        req = self._request(EndMomentLeft(moment_nm=4_000.0))
        resp = solve(req)
        assert math.isclose(resp.max_deflection_m, 0.005632685553069521, rel_tol=1e-9)
        assert "1k" in resp.roark_reference  # the kernel must label its provenance
