"""Pydantic v2 schemas for the EngineerCalc beam solver.

All quantities are SI internally:
    length          metres        (m)
    force           newtons       (N)
    moment          newton-metres (N·m)
    distributed     N/m
    modulus         pascals       (Pa)
    second moment   m^4
    deflection      metres        (m)
    stress          pascals       (Pa)

Unit conversion happens at the API edge (the FastAPI route), not here.
This module trusts SI in, returns SI out — period.
"""

from __future__ import annotations

from typing import Annotated, Literal, Union

from pydantic import BaseModel, Field, model_validator

# ─── Geometry & material ────────────────────────────────────────────────


class BeamMaterial(BaseModel):
    """Linear-elastic isotropic material — only `E` matters for v0.1."""

    name: str = Field(default="Custom", description="Display label, e.g. 'Steel A36'.")
    youngs_modulus_pa: Annotated[float, Field(gt=0, description="Young's modulus E in pascals.")]


class BeamSection(BaseModel):
    """Cross-section geometry. Either provide `I` (and `c`) directly, or pick a shape."""

    shape: Literal["custom", "rectangle", "circle", "w_shape"] = "custom"
    second_moment_m4: Annotated[float, Field(gt=0, description="I in m^4.")]
    extreme_fibre_distance_m: Annotated[
        float | None,
        Field(
            ge=0,
            description=(
                "Distance c from neutral axis to extreme fibre (m). "
                "Required if you want sigma_max in the response."
            ),
        ),
    ] = None
    label: str = Field(default="Custom section")


# ─── Load cases (discriminated union) ───────────────────────────────────


class _LoadCaseBase(BaseModel):
    kind: str  # the discriminator — overridden in concrete subclasses


class PointLoadCentre(_LoadCaseBase):
    kind: Literal["point_load_centre"] = "point_load_centre"
    magnitude_n: Annotated[float, Field(description="Point load P in newtons (positive downward).")]


class PointLoadArbitrary(_LoadCaseBase):
    kind: Literal["point_load_arbitrary"] = "point_load_arbitrary"
    magnitude_n: Annotated[float, Field(description="Point load P in newtons (positive downward).")]
    position_m: Annotated[
        float,
        Field(ge=0, description="Distance a from the LEFT support, in metres. Must satisfy 0 ≤ a ≤ L."),
    ]


class UdlFullSpan(_LoadCaseBase):
    kind: Literal["udl_full_span"] = "udl_full_span"
    intensity_n_per_m: Annotated[
        float, Field(description="Distributed load w in N/m (positive downward).")
    ]


class EndMomentLeft(_LoadCaseBase):
    kind: Literal["end_moment_left"] = "end_moment_left"
    moment_nm: Annotated[
        float, Field(description="Applied moment M0 at the left support, in N·m.")
    ]


LoadCase = Annotated[
    Union[PointLoadCentre, PointLoadArbitrary, UdlFullSpan, EndMomentLeft],
    Field(discriminator="kind"),
]


# ─── Request & Response ─────────────────────────────────────────────────


class BeamSolveRequest(BaseModel):
    """Single-span, simply-supported, prismatic beam. One load case at a time."""

    length_m: Annotated[float, Field(gt=0, description="Span length L in metres.")]
    material: BeamMaterial
    section: BeamSection
    load: LoadCase
    sample_points: Annotated[
        int,
        Field(
            ge=11,
            le=2001,
            description="Number of sample points along the beam for δ(x) and M(x) curves.",
        ),
    ] = 201

    @model_validator(mode="after")
    def _validate_load_geometry(self) -> "BeamSolveRequest":
        if isinstance(self.load, PointLoadArbitrary):
            if not (0.0 <= self.load.position_m <= self.length_m):
                raise ValueError(
                    f"Point-load position a={self.load.position_m} must lie within [0, L={self.length_m}]."
                )
        return self


class CurveSamples(BaseModel):
    """A sampled curve along the beam. `x_m`, `value` are equal-length vectors."""

    x_m: list[float]
    value: list[float]


class BeamSolveResponse(BaseModel):
    """All standard outputs from a single solve."""

    # Reactions (positive = upward)
    reaction_left_n: float
    reaction_right_n: float

    # Maxima
    max_bending_moment_nm: float
    max_bending_moment_at_m: float
    max_shear_n: float
    max_deflection_m: float
    max_deflection_at_m: float

    # Optional, only if section.extreme_fibre_distance_m is supplied
    max_bending_stress_pa: float | None = None

    # Sampled curves
    deflection_curve: CurveSamples
    bending_moment_curve: CurveSamples
    shear_curve: CurveSamples

    # Echo of inputs that drive the answer (lets the UI show a verification panel)
    flexural_rigidity_ei_nm2: float
    span_m: float

    # The Roark reference cell this solver claims to match — UI surfaces it.
    roark_reference: str
