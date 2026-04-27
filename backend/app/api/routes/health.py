from datetime import datetime, timezone

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.core.config import settings
from app.db.session import get_engine

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


@router.get("/ready")
def ready():
    eng = get_engine()
    if not eng:
        if settings.require_database:
            return JSONResponse(
                status_code=503,
                content={"ok": False, "db": False, "reason": "DATABASE_URL is required but not configured"},
            )
        return {"ok": True, "db": False, "reason": "DATABASE_URL not configured (memory mode)"}
    try:
        with eng.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"ok": True, "db": True}
    except Exception as exc:
        return JSONResponse(status_code=503, content={"ok": False, "db": True, "error": str(exc)})
