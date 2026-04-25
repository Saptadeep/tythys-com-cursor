from fastapi import APIRouter, Header, HTTPException

from app.core.config import settings
from app.schemas.ingest import (
    IngestEventsRequest,
    IngestEventsResponse,
    IngestLatestResponse,
)
from app.services.ingest_service import store

router = APIRouter(prefix="/ingest", tags=["ingest"])


def _validate_api_key(x_api_key: str | None):
    if x_api_key != settings.ingest_api_key:
        raise HTTPException(status_code=401, detail="Invalid API key.")


@router.post("/events", response_model=IngestEventsResponse)
def ingest_events(payload: IngestEventsRequest, x_api_key: str | None = Header(default=None)):
    _validate_api_key(x_api_key)
    total_stored = store.add_events(payload)
    last_event_at = payload.events[-1].timestamp if payload.events else None
    return IngestEventsResponse(
        accepted=True,
        received_count=len(payload.events),
        total_stored=total_stored,
        last_event_at=last_event_at,
    )


@router.get("/events/latest", response_model=IngestLatestResponse)
def latest_events(x_api_key: str | None = Header(default=None)):
    _validate_api_key(x_api_key)
    return store.latest()
