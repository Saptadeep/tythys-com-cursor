from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.schemas.read_models import IncidentDTO
from app.services.read_api import list_current_incidents

router = APIRouter(prefix="/incidents", tags=["incidents"])


@router.get("/current", response_model=list[IncidentDTO])
def incidents_current(session: Session | None = Depends(get_db)):
    if session is None:
        return []
    return list_current_incidents(session)
