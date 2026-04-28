"""Public solver: takes a typed request, dispatches to the correct kernel,
and shapes the output into a ``BeamSolveResponse``."""

from __future__ import annotations

from app.services.beam_calc.cases import (
    CaseResult,
    solve_end_moment,
    solve_point_load_arbitrary,
    solve_point_load_centre,
    solve_udl_full_span,
)
from app.services.beam_calc.types import (
    BeamSolveRequest,
    BeamSolveResponse,
    CurveSamples,
    EndMomentLeft,
    PointLoadArbitrary,
    PointLoadCentre,
    UdlFullSpan,
)


def solve(request: BeamSolveRequest) -> BeamSolveResponse:
    """Dispatch on load case and return the standard response object."""
    EI = request.material.youngs_modulus_pa * request.section.second_moment_m4
    L = request.length_m
    n = request.sample_points

    load = request.load
    result: CaseResult
    if isinstance(load, PointLoadCentre):
        result = solve_point_load_centre(
            length_m=L, ei_nm2=EI, magnitude_n=load.magnitude_n, sample_points=n
        )
    elif isinstance(load, PointLoadArbitrary):
        result = solve_point_load_arbitrary(
            length_m=L,
            ei_nm2=EI,
            magnitude_n=load.magnitude_n,
            position_m=load.position_m,
            sample_points=n,
        )
    elif isinstance(load, UdlFullSpan):
        result = solve_udl_full_span(
            length_m=L, ei_nm2=EI, intensity_n_per_m=load.intensity_n_per_m, sample_points=n
        )
    elif isinstance(load, EndMomentLeft):
        result = solve_end_moment(
            length_m=L, ei_nm2=EI, moment_nm=load.moment_nm, sample_points=n
        )
    else:  # pragma: no cover  — exhaustiveness guard
        raise TypeError(f"Unsupported load kind: {type(load).__name__}")

    sigma_max: float | None = None
    c = request.section.extreme_fibre_distance_m
    if c is not None:
        sigma_max = result.max_bending_moment_nm * c / request.section.second_moment_m4

    return BeamSolveResponse(
        reaction_left_n=result.reaction_left_n,
        reaction_right_n=result.reaction_right_n,
        max_bending_moment_nm=result.max_bending_moment_nm,
        max_bending_moment_at_m=result.max_bending_moment_at_m,
        max_shear_n=result.max_shear_n,
        max_deflection_m=result.max_deflection_m,
        max_deflection_at_m=result.max_deflection_at_m,
        max_bending_stress_pa=sigma_max,
        deflection_curve=CurveSamples(x_m=result.deflection_x, value=result.deflection_value),
        bending_moment_curve=CurveSamples(
            x_m=result.bending_moment_x, value=result.bending_moment_value
        ),
        shear_curve=CurveSamples(x_m=result.shear_x, value=result.shear_value),
        flexural_rigidity_ei_nm2=EI,
        span_m=L,
        roark_reference=result.roark_reference,
    )
