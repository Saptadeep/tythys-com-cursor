"""HTTP API for the EngineerCalc beam solver.

Mounted at ``/v1/beam-calc/solve``. The core solver in
``app.services.beam_calc`` is SI-only by contract. This route is the single
place that talks to consumers, so it is also the single place that does
unit conversion. When ``?units=imperial`` is requested, the route:

    1. Interprets each numeric request field as its "natural" imperial
       unit — feet for spans/positions, lbf for point loads, lbf/ft for
       distributed loads, lbf·ft for moments, psi for the modulus, in⁴
       for the second moment of area, inches for the extreme-fibre
       distance — converts to SI, then calls ``solve()``.
    2. Converts every numeric response field back to the matching imperial
       unit before serialising. Field names are not renamed (they always
       end in ``_n``, ``_m``, ``_pa``, …); the response's ``units``
       discriminator is set to ``"imperial"`` so consumers know how to
       read the numbers.

Validation errors from Pydantic and domain errors raised by the solver
are both surfaced as HTTP 422 with a clean message.
"""

from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, HTTPException, Query
from pydantic import ValidationError

from app.services.beam_calc import (
    BeamSolveRequest,
    BeamSolveResponse,
    solve,
)
from app.services.beam_calc.types import (
    BeamMaterial,
    BeamSection,
    CurveSamples,
    EndMomentLeft,
    PointLoadArbitrary,
    PointLoadCentre,
    UdlFullSpan,
)

router = APIRouter(prefix="/beam-calc", tags=["beam-calc"])


# ── Conversion factors (exact, by definition of the international foot
#    and pound-force) ─────────────────────────────────────────────────────
FT_PER_M = 0.3048
IN_PER_M = 0.0254
LBF_PER_N = 4.4482216152605
PSI_PER_PA = 6894.757293168361
IN4_PER_M4 = IN_PER_M**4

# Composite factors used in moment / distributed-load / EI conversions.
# 1 lbf·ft = LBF_PER_N · FT_PER_M  newton-metres
LBF_FT_PER_NM = LBF_PER_N * FT_PER_M
# 1 lbf/ft  = LBF_PER_N / FT_PER_M  newtons per metre
LBF_PER_FT_PER_NPM = LBF_PER_N / FT_PER_M
# 1 lbf·in² = PSI_PER_PA · IN4_PER_M4  newton-metre² (since psi · in⁴ = lbf·in²
#   and 1 lbf·in² in N·m² is exactly that product)
LBF_IN2_PER_NM2 = PSI_PER_PA * IN4_PER_M4


def _request_to_si(req: BeamSolveRequest) -> BeamSolveRequest:
    """Treat ``req`` as imperial-unit numbers; return an SI equivalent.

    Re-runs Pydantic validation on the way out — if the conversion produces
    an invalid SI request (e.g. point-load position outside the span), the
    raised ``ValidationError`` is caught by the route and returned as 422.
    """
    L_si = req.length_m * FT_PER_M
    mat_si = BeamMaterial(
        name=req.material.name,
        youngs_modulus_pa=req.material.youngs_modulus_pa * PSI_PER_PA,
    )
    sec_si = BeamSection(
        shape=req.section.shape,
        second_moment_m4=req.section.second_moment_m4 * IN4_PER_M4,
        extreme_fibre_distance_m=(
            req.section.extreme_fibre_distance_m * IN_PER_M
            if req.section.extreme_fibre_distance_m is not None
            else None
        ),
        label=req.section.label,
    )

    load = req.load
    load_si: PointLoadCentre | PointLoadArbitrary | UdlFullSpan | EndMomentLeft
    if isinstance(load, PointLoadCentre):
        load_si = PointLoadCentre(magnitude_n=load.magnitude_n * LBF_PER_N)
    elif isinstance(load, PointLoadArbitrary):
        load_si = PointLoadArbitrary(
            magnitude_n=load.magnitude_n * LBF_PER_N,
            position_m=load.position_m * FT_PER_M,
        )
    elif isinstance(load, UdlFullSpan):
        load_si = UdlFullSpan(
            intensity_n_per_m=load.intensity_n_per_m * LBF_PER_FT_PER_NPM
        )
    elif isinstance(load, EndMomentLeft):
        load_si = EndMomentLeft(moment_nm=load.moment_nm * LBF_FT_PER_NM)
    else:  # pragma: no cover — exhaustiveness guard
        raise TypeError(f"Unsupported load kind: {type(load).__name__}")

    return BeamSolveRequest(
        length_m=L_si,
        material=mat_si,
        section=sec_si,
        load=load_si,
        sample_points=req.sample_points,
    )


def _response_to_imperial(resp: BeamSolveResponse) -> BeamSolveResponse:
    """Take an SI response, return its imperial twin.

    Convention (matches the request side):
        force          → lbf
        position       → ft
        moment         → lbf·ft
        deflection     → in
        stress         → psi
        EI             → lbf·in²
    """
    return BeamSolveResponse(
        reaction_left_n=resp.reaction_left_n / LBF_PER_N,
        reaction_right_n=resp.reaction_right_n / LBF_PER_N,
        max_bending_moment_nm=resp.max_bending_moment_nm / LBF_FT_PER_NM,
        max_bending_moment_at_m=resp.max_bending_moment_at_m / FT_PER_M,
        max_shear_n=resp.max_shear_n / LBF_PER_N,
        max_deflection_m=resp.max_deflection_m / IN_PER_M,
        max_deflection_at_m=resp.max_deflection_at_m / FT_PER_M,
        max_bending_stress_pa=(
            resp.max_bending_stress_pa / PSI_PER_PA
            if resp.max_bending_stress_pa is not None
            else None
        ),
        deflection_curve=CurveSamples(
            x_m=[x / FT_PER_M for x in resp.deflection_curve.x_m],
            value=[v / IN_PER_M for v in resp.deflection_curve.value],
        ),
        bending_moment_curve=CurveSamples(
            x_m=[x / FT_PER_M for x in resp.bending_moment_curve.x_m],
            value=[v / LBF_FT_PER_NM for v in resp.bending_moment_curve.value],
        ),
        shear_curve=CurveSamples(
            x_m=[x / FT_PER_M for x in resp.shear_curve.x_m],
            value=[v / LBF_PER_N for v in resp.shear_curve.value],
        ),
        flexural_rigidity_ei_nm2=resp.flexural_rigidity_ei_nm2 / LBF_IN2_PER_NM2,
        span_m=resp.span_m / FT_PER_M,
        roark_reference=resp.roark_reference,
        units="imperial",
    )


@router.post("/solve", response_model=BeamSolveResponse)
def solve_beam(
    payload: BeamSolveRequest,
    units: Literal["si", "imperial"] = Query(
        default="si",
        description=(
            "Unit system for both request and response. SI is the default; "
            "'imperial' uses ft / lbf / lbf·ft / lbf/ft / psi / in⁴ / in / lbf·in²."
        ),
    ),
) -> BeamSolveResponse:
    """Solve a single-span, simply-supported, prismatic beam.

    Returns reactions, maxima, sampled deflection / shear / moment curves,
    and (if the section's extreme-fibre distance is supplied) the maximum
    bending stress. Numeric provenance is matched against
    *Roark's Formulas for Stress and Strain*, 7th ed., Table 8.1.
    """
    try:
        si_req = _request_to_si(payload) if units == "imperial" else payload
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=exc.errors()) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    try:
        resp = solve(si_req)
    except ValueError as exc:
        # Defence-in-depth: the schema should already have caught this at
        # body-parse time, but the kernels also assert geometric validity.
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    return _response_to_imperial(resp) if units == "imperial" else resp
