from collections.abc import Generator

from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_session_factory


def get_db() -> Generator[Session | None, None, None]:
    if not settings.database_url:
        yield None
        return
    factory = get_session_factory()
    if factory is None:
        yield None
        return
    session = factory()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
