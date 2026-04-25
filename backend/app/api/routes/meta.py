from fastapi import APIRouter

from app.core.config import settings

router = APIRouter(prefix="/meta", tags=["meta"])


@router.get("/version")
def version():
    return {"version": settings.app_version, "name": settings.app_name, "mode": settings.backend_service_mode}
