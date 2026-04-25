from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.schemas.read_models import TimelineEventDTO
from app.services.read_api import list_timeline

router = APIRouter(prefix="/timeline", tags=["timeline"])


@router.get("/", response_model=list[TimelineEventDTO])
def timeline(session: Session | None = Depends(get_db)):
    if session is None:
        return []
    return list_timeline(session)
