from datetime import datetime

from pydantic import BaseModel, Field


class IngestEvent(BaseModel):
    request_id: str = Field(min_length=1, max_length=128)
    route: str = Field(min_length=1, max_length=256)
    status: int = Field(ge=100, le=599)
    latency_ms: int = Field(ge=0)
    bytes_sent: int = Field(ge=0)
    timestamp: datetime
    tenant: str = Field(min_length=1, max_length=128)


class IngestEventsRequest(BaseModel):
    service_id: str = Field(min_length=1, max_length=128)
    events: list[IngestEvent] = Field(min_length=1, max_length=500)


class IngestEventsResponse(BaseModel):
    accepted: bool
    received_count: int
    total_stored: int
    last_event_at: datetime | None


class IngestLatestResponse(BaseModel):
    service_id: str | None
    total_events: int
    last_event_at: datetime | None
    recent_event_count: int
    error_events_last_window: int
