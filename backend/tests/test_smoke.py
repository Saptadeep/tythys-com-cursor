import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.main import validate_runtime_settings


def test_health():
    with TestClient(app) as client:
        r = client.get("/health")
        assert r.status_code == 200
        body = r.json()
        assert body["ok"] is True


def test_version():
    with TestClient(app) as client:
        r = client.get("/v1/meta/version")
        assert r.status_code == 200
        assert "version" in r.json()


def test_ingest_validation_empty_events():
    with TestClient(app) as client:
        r = client.post(
            "/v1/ingest/events",
            json={"service_id": "api-gateway-observability", "events": []},
            headers={"x-api-key": "dev-ingest-key"},
        )
        assert r.status_code == 422


def test_ingest_memory_mode_accepts_batch():
    with TestClient(app) as client:
        payload = {
            "service_id": "api-gateway-observability",
            "events": [
                {
                    "request_id": "req-1",
                    "route": "/checkout",
                    "status": 200,
                    "latency_ms": 120,
                    "bytes_sent": 1024,
                    "timestamp": "2026-04-25T12:00:00Z",
                    "tenant": "default",
                }
            ],
        }
        r = client.post("/v1/ingest/events", json=payload, headers={"x-api-key": "dev-ingest-key"})
        assert r.status_code == 200
        body = r.json()
        assert body["accepted"] is True


def test_require_database_guard_raises_without_database_url():
    from app.core.config import settings

    original_require_database = settings.require_database
    original_database_url = settings.database_url
    settings.require_database = True
    settings.database_url = None
    try:
        with pytest.raises(RuntimeError, match="DATABASE_URL is required"):
            validate_runtime_settings()
    finally:
        settings.require_database = original_require_database
        settings.database_url = original_database_url
