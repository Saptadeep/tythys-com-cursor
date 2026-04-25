from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.schemas.read_models import EndpointHealthDTO
from app.services.read_api import list_endpoint_health

router = APIRouter(prefix="/endpoints", tags=["endpoints"])


@router.get("/health", response_model=list[EndpointHealthDTO])
def endpoints_health(session: Session | None = Depends(get_db)):
    if session is None:
        return []
    return list_endpoint_health(session)
