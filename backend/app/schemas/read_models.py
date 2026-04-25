from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class IncidentDTO(BaseModel):
    id: str
    service_id: str
    title: str
    state: str
    severity: str
    route: str | None = None
    opened_at: datetime
    updated_at: datetime
    estimated_loss_per_hour_usd: float = Field(ge=0)
    affected_traffic_pct: float = Field(ge=0, le=100)


class EndpointHealthDTO(BaseModel):
    service_id: str
    route: str
    window_start: datetime
    window_end: datetime
    request_count: int
    error_count: int
    p95_latency_ms: float
    health: Literal["healthy", "degraded", "down"]


class ActionDTO(BaseModel):
    rank: int
    title: str
    rationale: str
    incident_id: str | None = None


class TimelineEventDTO(BaseModel):
    ts: datetime
    kind: Literal["rollup", "incident", "ingest"]
    message: str
