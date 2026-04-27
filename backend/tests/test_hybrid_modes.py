from __future__ import annotations

import os
import uuid
from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
import app.db.session as db_session_module
from app.main import app
from app.db.session import get_engine


def _reset_engine_cache() -> None:
    if db_session_module._engine is not None:
        db_session_module._engine.dispose()
    db_session_module._engine = None
    db_session_module._SessionLocal = None


@pytest.fixture
def runtime_settings_guard():
    original = {
        "database_url": settings.database_url,
        "require_database": settings.require_database,
        "bootstrap_db_schema": settings.bootstrap_db_schema,
        "backend_service_mode": settings.backend_service_mode,
    }
    _reset_engine_cache()
    yield
    settings.database_url = original["database_url"]
    settings.require_database = original["require_database"]
    settings.bootstrap_db_schema = original["bootstrap_db_schema"]
    settings.backend_service_mode = original["backend_service_mode"]
    _reset_engine_cache()


def test_ready_memory_mode(runtime_settings_guard):
    settings.require_database = False
    settings.database_url = None
    settings.backend_service_mode = "test-memory"

    with TestClient(app) as client:
        ready = client.get("/ready")

    assert ready.status_code == 200
    body = ready.json()
    assert body["ok"] is True
    assert body["db"] is False


def test_ready_requires_database_when_enabled(runtime_settings_guard):
    settings.require_database = True
    settings.database_url = None
    settings.backend_service_mode = "test-db-required"

    with TestClient(app) as client:
        ready = client.get("/ready")

    assert ready.status_code == 503
    body = ready.json()
    assert body["ok"] is False
    assert body["db"] is False


@pytest.mark.skipif(not os.getenv("TEST_DATABASE_URL"), reason="TEST_DATABASE_URL not set")
def test_postgres_backed_ingest_smoke(runtime_settings_guard):
    settings.database_url = os.environ["TEST_DATABASE_URL"]
    settings.require_database = True
    settings.bootstrap_db_schema = True
    settings.backend_service_mode = "test-postgres"

    service_id = f"svc-{uuid.uuid4().hex[:8]}"
    request_id = f"req-{uuid.uuid4().hex}"

    with TestClient(app) as client:
        ready = client.get("/ready")
        assert ready.status_code == 200
        assert ready.json()["db"] is True

        payload = {
            "service_id": service_id,
            "events": [
                {
                    "request_id": request_id,
                    "route": "/checkout",
                    "status": 200,
                    "latency_ms": 95,
                    "bytes_sent": 1234,
                    "timestamp": datetime.now(tz=timezone.utc).isoformat(),
                    "tenant": "default",
                }
            ],
        }
        ingest = client.post("/v1/ingest/events", json=payload, headers={"x-api-key": "dev-ingest-key"})
        assert ingest.status_code == 200
        assert ingest.json()["inserted_count"] == 1

        latest = client.get("/v1/ingest/events/latest", params={"service_id": service_id}, headers={"x-api-key": "dev-ingest-key"})
        assert latest.status_code == 200
        latest_body = latest.json()
        assert latest_body["total_events"] >= 1
        assert latest_body["service_id"] == service_id

    eng = get_engine()
    assert eng is not None
