"""Beam-deflection calculator core (EngineerCalc, v0.1).

Public surface:
    - solve(request) -> BeamSolveResponse
    - BeamSolveRequest, BeamSolveResponse, LoadCase, BeamSection
    - All four load-case kernels are exported individually for unit testing.

Spec:    docs/products/engineer-calc/00-spec.md
Physics: docs/products/engineer-calc/01-physics.md
"""

from __future__ import annotations

from app.services.beam_calc.cases import (
    solve_end_moment,
    solve_point_load_arbitrary,
    solve_point_load_centre,
    solve_udl_full_span,
)
from app.services.beam_calc.solve import solve
from app.services.beam_calc.types import (
    BeamMaterial,
    BeamSection,
    BeamSolveRequest,
    BeamSolveResponse,
    LoadCase,
)

__all__ = [
    "BeamMaterial",
    "BeamSection",
    "BeamSolveRequest",
    "BeamSolveResponse",
    "LoadCase",
    "solve",
    "solve_end_moment",
    "solve_point_load_arbitrary",
    "solve_point_load_centre",
    "solve_udl_full_span",
]
