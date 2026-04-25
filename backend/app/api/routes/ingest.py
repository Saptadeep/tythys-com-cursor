from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.deps import get_db
from app.schemas.ingest import (
    IngestEventsRequest,
    IngestEventsResponse,
    IngestLatestResponse,
)
from app.services.auth_api_key import resolve_tenant_id
from app.services.ingest_db import insert_events, latest_from_db
from app.services.ingest_service import store

router = APIRouter(prefix="/ingest", tags=["ingest"])


@router.post("/events", response_model=IngestEventsResponse)
def ingest_events(
    payload: IngestEventsRequest,
    x_api_key: str | None = Header(default=None),
    session: Session | None = Depends(get_db),
):
    tenant_id = resolve_tenant_id(session, x_api_key)

    if session is None:
        received, inserted, skipped, total, last_ts = store.add_events(payload)
        return IngestEventsResponse(
            accepted=True,
            received_count=received,
            inserted_count=inserted,
            duplicates_skipped=skipped,
            total_stored=total,
            last_event_at=last_ts,
        )

    received, inserted, skipped, total = insert_events(session, tenant_id, payload)
    last_ts = payload.events[-1].timestamp if payload.events else None
    return IngestEventsResponse(
        accepted=True,
        received_count=received,
        inserted_count=inserted,
        duplicates_skipped=skipped,
        total_stored=total,
        last_event_at=last_ts,
    )


@router.get("/events/latest", response_model=IngestLatestResponse)
def latest_events(
    x_api_key: str | None = Header(default=None),
    service_id: str | None = None,
    session: Session | None = Depends(get_db),
):
    tenant_id = resolve_tenant_id(session, x_api_key)

    if session is None:
        return store.latest()

    data = latest_from_db(session, tenant_id, service_id)
    return IngestLatestResponse(**data)
