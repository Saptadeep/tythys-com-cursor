from __future__ import annotations

import asyncio
import logging
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import case, delete, func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import ActionQueueItem, EndpointRollup, IncidentRecord, RawEvent, Tenant
from app.db.session import get_session_factory

logger = logging.getLogger(__name__)


def _window_bucket(now: datetime) -> tuple[datetime, datetime]:
    minute = (now.minute // 5) * 5
    window_end = now.replace(minute=minute, second=0, microsecond=0)
    window_start = window_end - timedelta(minutes=5)
    return window_start, window_end


def run_rollup_cycle(session: Session) -> None:
    if not settings.database_url:
        return

    now = datetime.now(tz=timezone.utc)
    window_start, window_end = _window_bucket(now)

    session.execute(delete(ActionQueueItem))

    tenants = list(session.execute(select(Tenant)).scalars().all())
    for tenant in tenants:
        session.execute(
            delete(EndpointRollup).where(
                EndpointRollup.tenant_id == tenant.id,
                EndpointRollup.window_start == window_start,
            ),
        )

        stmt = (
            select(
                RawEvent.service_id,
                RawEvent.route,
                func.count().label("cnt"),
                func.sum(case((RawEvent.status >= 500, 1), else_=0)).label("errs"),
                (func.avg(RawEvent.latency_ms) * 1.25).label("p95_proxy"),
            )
            .where(
                RawEvent.tenant_id == tenant.id,
                RawEvent.ts >= window_start,
                RawEvent.ts < window_end,
            )
            .group_by(RawEvent.service_id, RawEvent.route)
        )

        rows = session.execute(stmt).all()
        for service_id, route, cnt, errs, p95_proxy in rows:
            session.add(
                EndpointRollup(
                    id=uuid.uuid4(),
                    tenant_id=tenant.id,
                    service_id=service_id,
                    route=route,
                    window_start=window_start,
                    window_end=window_end,
                    request_count=int(cnt or 0),
                    error_count=int(errs or 0),
                    p95_latency_ms=float(p95_proxy or 0.0),
                ),
            )

        session.flush()

        for service_id, route, cnt, errs, p95_proxy in rows:
            cnt_i = int(cnt or 0)
            errs_i = int(errs or 0)
            err_rate = errs_i / cnt_i if cnt_i else 0.0
            p95 = float(p95_proxy or 0.0)
            if err_rate >= 0.05 or p95 >= 800:
                existing = session.execute(
                    select(IncidentRecord).where(
                        IncidentRecord.tenant_id == tenant.id,
                        IncidentRecord.service_id == service_id,
                        IncidentRecord.route == route,
                        IncidentRecord.state == "open",
                    ),
                ).scalar_one_or_none()
                if existing is None:
                    title = f"Elevated risk on {route}"
                    detail = (
                        f"Window {window_start.isoformat()}..{window_end.isoformat()} "
                        f"err_rate={err_rate:.3f} p95_proxy_ms={p95:.1f}"
                    )
                    session.add(
                        IncidentRecord(
                            id=uuid.uuid4(),
                            tenant_id=tenant.id,
                            service_id=service_id,
                            title=title,
                            state="open",
                            severity="high" if err_rate >= 0.1 else "medium",
                            route=route,
                            opened_at=now,
                            updated_at=now,
                            detail=detail,
                        ),
                    )

    session.flush()

    open_incidents = list(session.execute(select(IncidentRecord).where(IncidentRecord.state == "open")).scalars().all())
    open_incidents.sort(key=lambda i: (0 if i.severity == "high" else 1, i.opened_at))
    rank = 1
    for inc in open_incidents[:10]:
        session.add(
            ActionQueueItem(
                id=uuid.uuid4(),
                tenant_id=inc.tenant_id,
                incident_id=inc.id,
                rank=rank,
                title=f"Mitigate: {inc.title}",
                rationale=inc.detail or "No additional detail.",
                created_at=now,
            ),
        )
        rank += 1

    session.commit()


async def rollup_loop(stop: asyncio.Event) -> None:
    factory = get_session_factory()
    if factory is None:
        return
    while not stop.is_set():
        try:
            session = factory()
            try:
                run_rollup_cycle(session)
            finally:
                session.close()
        except Exception:
            logger.exception("rollup cycle failed")
        try:
            await asyncio.wait_for(stop.wait(), timeout=float(settings.rollup_interval_seconds))
        except TimeoutError:
            continue
