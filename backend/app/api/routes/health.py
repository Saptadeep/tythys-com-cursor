from datetime import datetime, timezone

from fastapi import APIRouter

from app.core.config import settings

router = APIRouter(prefix="", tags=["health"])
started_at = datetime.now(tz=timezone.utc)


@router.get("/health")
def health():
    uptime_sec = int((datetime.now(tz=timezone.utc) - started_at).total_seconds())
    return {
        "ok": True,
        "service": settings.app_name,
        "version": settings.app_version,
        "mode": settings.backend_service_mode,
        "uptimeSec": uptime_sec,
    }
