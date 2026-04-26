from __future__ import annotations

from pydantic import BaseModel, Field


class MetricsSummary(BaseModel):
    rps: float
    total_requests: int
    error_rate: float
    avg_latency: float
    p95_latency: float


class RouteMetric(BaseModel):
    path: str
    hits: int
    error_rate: float
    avg_latency: float


class ClientMetric(BaseModel):
    ip: str
    requests: int


class TimeSeriesMetric(BaseModel):
    rps: list[float] = Field(default_factory=list)
    latency: list[float] = Field(default_factory=list)
    errors: list[float] = Field(default_factory=list)


class MetricsResponse(BaseModel):
    summary: MetricsSummary
    routes: list[RouteMetric]
    clients: list[ClientMetric]
    timeseries: TimeSeriesMetric


class NginxEvent(BaseModel):
    timestamp: float
    ip: str
    path: str
    status: int
    latency_ms: float


class IngestLineRequest(BaseModel):
    line: str


class IngestBatchRequest(BaseModel):
    lines: list[str]
