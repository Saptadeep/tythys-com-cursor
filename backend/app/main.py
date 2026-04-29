from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.routes.actions import router as actions_router
from app.api.routes.beam_calc import router as beam_calc_router
from app.api.routes.endpoints import router as endpoints_router
from app.api.routes.health import router as health_router
from app.api.routes.incidents import router as incidents_router
from app.api.routes.ingest import router as ingest_router
from app.api.routes.meta import router as meta_router
from app.api.routes.services import router as services_router
from app.api.routes.timeline import router as timeline_router
from app.core.config import settings
from app.db import models  # noqa: F401
from app.db.base import Base
from app.db.seed import ensure_default_tenant_and_api_key
from app.db.session import get_engine, get_session_factory
from app.workers.rollup_worker import rollup_loop


def validate_runtime_settings() -> None:
    if settings.require_database and not settings.database_url:
        raise RuntimeError("DATABASE_URL is required when REQUIRE_DATABASE=true.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    validate_runtime_settings()
    eng = get_engine()
    if eng is not None and settings.bootstrap_db_schema:
        Base.metadata.create_all(bind=eng)

    if eng is not None:
        factory = get_session_factory()
        if factory is not None:
            session = factory()
            try:
                ensure_default_tenant_and_api_key(session)
                session.commit()
            finally:
                session.close()

    stop = asyncio.Event()
    worker = asyncio.create_task(rollup_loop(stop))
    try:
        yield
    finally:
        stop.set()
        await worker


app = FastAPI(title=settings.app_name, version=settings.app_version, lifespan=lifespan)

app.include_router(health_router)
app.include_router(meta_router, prefix="/v1")
app.include_router(services_router, prefix="/v1")
app.include_router(ingest_router, prefix="/v1")
app.include_router(incidents_router, prefix="/v1")
app.include_router(endpoints_router, prefix="/v1")
app.include_router(actions_router, prefix="/v1")
app.include_router(timeline_router, prefix="/v1")
app.include_router(beam_calc_router, prefix="/v1")
