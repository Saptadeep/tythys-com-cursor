from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.schemas.read_models import ActionDTO
from app.services.read_api import list_prioritized_actions

router = APIRouter(prefix="/actions", tags=["actions"])


@router.get("/prioritized", response_model=list[ActionDTO])
def actions_prioritized(session: Session | None = Depends(get_db)):
    if session is None:
        return []
    return list_prioritized_actions(session)
