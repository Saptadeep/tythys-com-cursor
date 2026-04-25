from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import ActionQueueItem, EndpointRollup, IncidentRecord, RawEvent
from app.schemas.read_models import ActionDTO, EndpointHealthDTO, IncidentDTO, TimelineEventDTO


def _estimate_impact(error_count: int, request_count: int) -> tuple[float, float]:
    err_rate = error_count / request_count if request_count else 0.0
    affected = min(99.0, err_rate * 100.0 * 3.0)
    loss = request_count * settings.revenue_value_per_success_usd * err_rate * 25.0
    return float(loss), float(affected)


def list_current_incidents(session: Session) -> list[IncidentDTO]:
    rows = list(
        session.execute(select(IncidentRecord).where(IncidentRecord.state == "open").order_by(IncidentRecord.opened_at.desc())).scalars().all(),
    )
    out: list[IncidentDTO] = []
    for inc in rows:
        rollup = session.execute(
            select(EndpointRollup)
            .where(
                EndpointRollup.tenant_id == inc.tenant_id,
                EndpointRollup.service_id == inc.service_id,
                EndpointRollup.route == inc.route,
            )
            .order_by(EndpointRollup.window_start.desc())
            .limit(1),
        ).scalar_one_or_none()
        loss, aff = (0.0, 0.0)
        if rollup:
            loss, aff = _estimate_impact(rollup.error_count, rollup.request_count)
        sev: str = inc.severity
        if sev not in ("low", "medium", "high"):
            sev = "medium"
        out.append(
            IncidentDTO(
                id=str(inc.id),
                service_id=inc.service_id,
                title=inc.title,
                state=str(inc.state),
                severity=sev,
                route=inc.route,
                opened_at=inc.opened_at,
                updated_at=inc.updated_at,
                estimated_loss_per_hour_usd=loss,
                affected_traffic_pct=aff,
            ),
        )
    return out


def list_endpoint_health(session: Session, limit: int = 50) -> list[EndpointHealthDTO]:
    rows = list(
        session.execute(select(EndpointRollup).order_by(EndpointRollup.window_start.desc()).limit(limit)).scalars().all(),
    )
    out: list[EndpointHealthDTO] = []
    for r in rows:
        err_rate = r.error_count / r.request_count if r.request_count else 0.0
        if err_rate >= 0.1 or r.p95_latency_ms >= 1200:
            health = "down"
        elif err_rate >= 0.05 or r.p95_latency_ms >= 800:
            health = "degraded"
        else:
            health = "healthy"
        out.append(
            EndpointHealthDTO(
                service_id=r.service_id,
                route=r.route,
                window_start=r.window_start,
                window_end=r.window_end,
                request_count=r.request_count,
                error_count=r.error_count,
                p95_latency_ms=r.p95_latency_ms,
                health=health,
            ),
        )
    return out


def list_prioritized_actions(session: Session) -> list[ActionDTO]:
    rows = list(session.execute(select(ActionQueueItem).order_by(ActionQueueItem.rank.asc())).scalars().all())
    return [
        ActionDTO(
            rank=r.rank,
            title=r.title,
            rationale=r.rationale,
            incident_id=str(r.incident_id) if r.incident_id else None,
        )
        for r in rows
    ]


def list_timeline(session: Session, limit: int = 50) -> list[TimelineEventDTO]:
    now = datetime.now(tz=timezone.utc)
    since = now - timedelta(hours=24)
    events: list[TimelineEventDTO] = []

    rollups = list(
        session.execute(
            select(EndpointRollup).where(EndpointRollup.window_start >= since).order_by(EndpointRollup.window_start.desc()).limit(20),
        ).scalars().all(),
    )
    for r in rollups:
        events.append(
            TimelineEventDTO(
                ts=r.window_end,
                kind="rollup",
                message=f"Rollup {r.service_id} {r.route} req={r.request_count} err={r.error_count} p95~{r.p95_latency_ms:.1f}ms",
            ),
        )

    incs = list(
        session.execute(select(IncidentRecord).where(IncidentRecord.opened_at >= since).order_by(IncidentRecord.opened_at.desc()).limit(20)).scalars().all(),
    )
    for i in incs:
        events.append(
            TimelineEventDTO(
                ts=i.opened_at,
                kind="incident",
                message=f"Incident opened: {i.title}",
            ),
        )

    raw = list(
        session.execute(select(RawEvent).where(RawEvent.ts >= since).order_by(RawEvent.ts.desc()).limit(10)).scalars().all(),
    )
    for e in raw:
        events.append(
            TimelineEventDTO(
                ts=e.ts,
                kind="ingest",
                message=f"Ingest {e.service_id} {e.route} status={e.status} latency={e.latency_ms}ms",
            ),
        )

    events.sort(key=lambda x: x.ts, reverse=True)
    return events[:limit]
