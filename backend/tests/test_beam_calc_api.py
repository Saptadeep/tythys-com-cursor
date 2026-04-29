"""HTTP integration tests for ``POST /v1/beam-calc/solve``.

Each happy-path test asserts that ``max_deflection_m`` reported by the
HTTP layer matches the corresponding pinned reference value in
``tests/test_beam_calc.py::TestRoarkNumericReferences``. If the two ever
drift apart, one of the two paths is wrong — either the route's wiring
or the formula it claims to implement.

The imperial round-trip test also pins the unit-conversion factors used
inside ``app.api.routes.beam_calc`` to their exact international
definitions; if the route ever silently changes a factor, this test will
go red even though the SI path keeps passing.

These tests only need the in-process FastAPI app — they do not need a
running Postgres. We force the lifespan into in-memory mode below by
patching ``settings`` *before* importing ``app.main``.
"""

from __future__ import annotations

import math

# Neutralise DB bootstrap inside the FastAPI lifespan so this suite runs
# whether or not the dev Postgres container is up. The DB-aware paths are
# exercised by their own tests; here we only need the HTTP surface.
from app.core.config import settings

settings.database_url = None
settings.require_database = False
settings.bootstrap_db_schema = False

from fastapi.testclient import TestClient  # noqa: E402  (must come after settings patch)

from app.main import app  # noqa: E402  (must come after settings patch)

# ── Shared problem fixtures (a "typical" small steel beam) ───────────────
E_STEEL = 200e9   # Pa
I_TYP = 8.2e-6    # m^4 (~ a small W6×12 ish)
L = 6.0           # m

# Conversion factors mirrored from app.api.routes.beam_calc. They MUST
# stay byte-for-byte identical to the ones in the route module — this
# duplication is intentional, so a silent change in either one is loud.
FT_PER_M = 0.3048
IN_PER_M = 0.0254
LBF_PER_N = 4.4482216152605
PSI_PER_PA = 6894.757293168361
IN4_PER_M4 = IN_PER_M**4


def _client() -> TestClient:
    return TestClient(app)


def _base_si_request(load: dict, *, c: float | None = None) -> dict:
    section: dict = {"shape": "custom", "second_moment_m4": I_TYP, "label": "Test"}
    if c is not None:
        section["extreme_fibre_distance_m"] = c
    return {
        "length_m": L,
        "material": {"name": "Steel A36", "youngs_modulus_pa": E_STEEL},
        "section": section,
        "load": load,
        "sample_points": 51,
    }


# ══════════════════════════════════════════════════════════════════════
#  Happy-path: one per load case — references pinned to TestRoarkNumericReferences
# ══════════════════════════════════════════════════════════════════════


def test_centre_load_matches_roark_reference():
    with _client() as c:
        r = c.post(
            "/v1/beam-calc/solve",
            json=_base_si_request({"kind": "point_load_centre", "magnitude_n": 10_000.0}),
        )
        assert r.status_code == 200
        body = r.json()
        assert math.isclose(body["max_deflection_m"], 0.02743902439024390, rel_tol=1e-9)
        assert math.isclose(body["max_bending_moment_nm"], 10_000.0 * L / 4.0, rel_tol=1e-9)
        assert body["roark_reference"]
        assert body["units"] == "si"


def test_udl_full_span_matches_roark_reference():
    with _client() as c:
        r = c.post(
            "/v1/beam-calc/solve",
            json=_base_si_request({"kind": "udl_full_span", "intensity_n_per_m": 5_000.0}),
        )
        assert r.status_code == 200
        body = r.json()
        assert math.isclose(body["max_deflection_m"], 0.05144817073170733, rel_tol=1e-9)
        assert math.isclose(body["max_bending_moment_nm"], 5_000.0 * L * L / 8.0, rel_tol=1e-9)


def test_point_load_arbitrary_matches_roark_reference():
    with _client() as c:
        r = c.post(
            "/v1/beam-calc/solve",
            json=_base_si_request(
                {"kind": "point_load_arbitrary", "magnitude_n": 10_000.0, "position_m": 2.0}
            ),
        )
        assert r.status_code == 200
        body = r.json()
        assert math.isclose(body["max_deflection_m"], 0.023324199615823056, rel_tol=1e-9)
        # M_max = P·a·b/L at x = a (a=2, b=4, L=6) = 10000·2·4/6 = 13333.333…
        assert math.isclose(body["max_bending_moment_nm"], 10_000.0 * 2.0 * 4.0 / L, rel_tol=1e-9)
        assert math.isclose(body["max_bending_moment_at_m"], 2.0, rel_tol=1e-9)


def test_end_moment_left_matches_roark_reference():
    with _client() as c:
        r = c.post(
            "/v1/beam-calc/solve",
            json=_base_si_request({"kind": "end_moment_left", "moment_nm": 4_000.0}),
        )
        assert r.status_code == 200
        body = r.json()
        assert math.isclose(body["max_deflection_m"], 0.005632685553069521, rel_tol=1e-9)
        assert math.isclose(body["max_bending_moment_nm"], 4_000.0, rel_tol=1e-9)
        # Reactions form a couple: R_A = M0/L up, R_B = -M0/L down.
        assert math.isclose(body["reaction_left_n"], 4_000.0 / L, rel_tol=1e-9)
        assert math.isclose(body["reaction_right_n"], -4_000.0 / L, rel_tol=1e-9)


# ══════════════════════════════════════════════════════════════════════
#  Response shape — every field the UI will rely on must be present
# ══════════════════════════════════════════════════════════════════════


def test_response_shape_carries_curves_and_metadata():
    with _client() as c:
        r = c.post(
            "/v1/beam-calc/solve",
            json=_base_si_request(
                {"kind": "point_load_centre", "magnitude_n": 10_000.0}, c=0.075
            ),
        )
        assert r.status_code == 200
        body = r.json()
        for key in (
            "reaction_left_n",
            "reaction_right_n",
            "max_bending_moment_nm",
            "max_bending_moment_at_m",
            "max_shear_n",
            "max_deflection_m",
            "max_deflection_at_m",
            "max_bending_stress_pa",
            "deflection_curve",
            "bending_moment_curve",
            "shear_curve",
            "flexural_rigidity_ei_nm2",
            "span_m",
            "roark_reference",
            "units",
        ):
            assert key in body, f"response missing field: {key}"
        assert len(body["deflection_curve"]["x_m"]) == 51
        assert len(body["deflection_curve"]["value"]) == 51
        assert len(body["bending_moment_curve"]["value"]) == 51
        assert len(body["shear_curve"]["value"]) == 51
        # σ_max = M_max · c / I  (c = 0.075 m; M_max = P·L/4)
        sigma_expected = (10_000.0 * L / 4.0) * 0.075 / I_TYP
        assert math.isclose(body["max_bending_stress_pa"], sigma_expected, rel_tol=1e-9)


# ══════════════════════════════════════════════════════════════════════
#  Validation errors → 422
# ══════════════════════════════════════════════════════════════════════


def test_negative_span_returns_422():
    payload = _base_si_request({"kind": "point_load_centre", "magnitude_n": 1_000.0})
    payload["length_m"] = -1.0
    with _client() as c:
        r = c.post("/v1/beam-calc/solve", json=payload)
        assert r.status_code == 422


def test_point_load_outside_span_returns_422():
    payload = _base_si_request(
        {"kind": "point_load_arbitrary", "magnitude_n": 1_000.0, "position_m": L + 0.1}
    )
    with _client() as c:
        r = c.post("/v1/beam-calc/solve", json=payload)
        assert r.status_code == 422


def test_unknown_load_kind_returns_422():
    payload = _base_si_request({"kind": "point_load_centre", "magnitude_n": 1_000.0})
    payload["load"] = {"kind": "ufo_strike", "magnitude_n": 1.0}
    with _client() as c:
        r = c.post("/v1/beam-calc/solve", json=payload)
        assert r.status_code == 422


# ══════════════════════════════════════════════════════════════════════
#  Imperial round-trip — same physics, different unit system
# ══════════════════════════════════════════════════════════════════════


def test_imperial_units_roundtrip_centre_load():
    """Send the canonical centre-load case in imperial units and confirm
    the response — interpreted as imperial — converts back to the same SI
    deflection that the SI path reports.
    """
    L_ft = L / FT_PER_M
    E_psi = E_STEEL / PSI_PER_PA
    I_in4 = I_TYP / IN4_PER_M4
    P_lbf = 10_000.0 / LBF_PER_N

    payload = {
        "length_m": L_ft,
        "material": {"name": "Steel A36", "youngs_modulus_pa": E_psi},
        "section": {"shape": "custom", "second_moment_m4": I_in4, "label": "Test"},
        "load": {"kind": "point_load_centre", "magnitude_n": P_lbf},
        "sample_points": 51,
    }
    with _client() as c:
        r = c.post("/v1/beam-calc/solve?units=imperial", json=payload)
        assert r.status_code == 200
        body = r.json()
        assert body["units"] == "imperial"
        # max_deflection_m is in INCHES on the imperial path. Convert back
        # to metres and confirm it matches the SI Roark reference.
        delta_m = body["max_deflection_m"] * IN_PER_M
        assert math.isclose(delta_m, 0.02743902439024390, rel_tol=1e-9)
        # span_m is in feet on the imperial path.
        assert math.isclose(body["span_m"] * FT_PER_M, L, rel_tol=1e-12)
        # Reaction: P/2 newtons → P/2 / LBF_PER_N pounds-force
        assert math.isclose(
            body["reaction_left_n"] * LBF_PER_N, 10_000.0 / 2.0, rel_tol=1e-9
        )
