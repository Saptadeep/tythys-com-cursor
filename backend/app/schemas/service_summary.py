from typing import Literal

from pydantic import BaseModel, Field


Health = Literal["healthy", "degraded", "down"]


class ServiceSummary(BaseModel):
    serviceId: str
    health: Health
    latencyMs: int = Field(ge=0)
    uptimePct: float = Field(ge=0, le=100)
    requestsPerMin: int = Field(ge=0)
    errorRatePct: float = Field(ge=0, le=100)
    notes: str | None = None
