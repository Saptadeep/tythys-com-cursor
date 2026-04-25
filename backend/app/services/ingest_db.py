from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.db.models import RawEvent
from app.schemas.ingest import IngestEventsRequest


def insert_events(
    session: Session,
    tenant_id: uuid.UUID,
    payload: IngestEventsRequest,
) -> tuple[int, int, int, int]:
    """
    Returns (received, inserted, duplicates_skipped, total_stored_for_service).
    """
    received = len(payload.events)
    inserted = 0
    skipped = 0

    for ev in payload.events:
        stmt = (
            insert(RawEvent)
            .values(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                service_id=payload.service_id,
                request_id=ev.request_id,
                route=ev.route,
                status=ev.status,
                latency_ms=ev.latency_ms,
                bytes_sent=ev.bytes_sent,
                ts=ev.timestamp,
            )
            .on_conflict_do_nothing(index_elements=[RawEvent.service_id, RawEvent.request_id])
        )
        res = session.execute(stmt)
        if res.rowcount == 1:
            inserted += 1
        else:
            skipped += 1

    total_count = session.scalar(
        select(func.count()).select_from(RawEvent).where(RawEvent.service_id == payload.service_id),
    )
    total_count = int(total_count or 0)

    return received, inserted, skipped, total_count


def latest_from_db(session: Session, tenant_id: uuid.UUID, service_id: str | None) -> dict:
    q = select(RawEvent).where(RawEvent.tenant_id == tenant_id)
    if service_id:
        q = q.where(RawEvent.service_id == service_id)
    q = q.order_by(RawEvent.ts.desc()).limit(20)
    rows = list(session.execute(q).scalars().all())
    if not rows:
        return {
            "service_id": service_id,
            "total_events": 0,
            "last_event_at": None,
            "recent_event_count": 0,
            "error_events_last_window": 0,
        }
    total = session.scalar(select(func.count()).select_from(RawEvent).where(RawEvent.tenant_id == tenant_id))
    total = int(total or 0)
    return {
        "service_id": service_id or rows[0].service_id,
        "total_events": total,
        "last_event_at": rows[0].ts,
        "recent_event_count": len(rows),
        "error_events_last_window": sum(1 for r in rows if r.status >= 500),
    }
