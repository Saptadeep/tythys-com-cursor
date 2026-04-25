from fastapi import APIRouter, Header, HTTPException

from app.schemas.service_summary import ServiceSummary
from app.services.summary_service import get_service_summary

router = APIRouter(prefix="/services", tags=["services"])


@router.get("/{service_id}/summary", response_model=ServiceSummary)
def service_summary(
    service_id: str,
    x_user_id: str | None = Header(default=None),
    authorization: str | None = Header(default=None),
):
    _ = (x_user_id, authorization)
    try:
        return get_service_summary(service_id)
    except ValueError as err:
        raise HTTPException(status_code=404, detail=str(err)) from err
