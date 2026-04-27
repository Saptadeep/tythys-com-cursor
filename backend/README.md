# Tythys API Revenue Guard Backend

FastAPI backend for ingest, rollups, incidents, and service summaries.

## Runtime and health behavior

- Runtime port binding is Railway-compatible by default via Docker CMD:
  - `uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}`
- `/health` is a lightweight liveness endpoint.
- `/ready` is a readiness endpoint:
  - returns `200` when the service is ready,
  - returns `503` when DB is required but missing/unreachable.
- Production safety guard:
  - when `REQUIRE_DATABASE=true` and `DATABASE_URL` is missing, app startup fails intentionally.

## Environment profiles (hybrid data mode)

Use one of the committed templates:

- `.env.local.quick.example` - local quick mode (in-memory, no DB).
- `.env.local.parity.example` - local parity mode (Docker Postgres).
- `.env.prod.example` - production profile (DB required).
- `.env.example` - default baseline (quick local mode).

Profile contract:

- **Prod profile**: `REQUIRE_DATABASE=true` and valid `DATABASE_URL`.
- **Local quick profile**: `REQUIRE_DATABASE=false` and empty `DATABASE_URL`.
- **Local parity profile**: `REQUIRE_DATABASE=true` and Postgres `DATABASE_URL`.

## Local quick start (in-memory mode)

# ONE TIME:
cd C:\tythys-com-cursor\backend
<!-- py -m venv .venv -->
py -3.12 -m venv .venv
call .venv\Scripts\activate.bat
pip install -r requirements.txt
copy /Y .env.local.quick.example .env
uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload

# Daily:
cd C:\tythys-com-cursor\backend
call .venv\Scripts\activate.bat
uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload

## Local parity mode (Postgres via Docker)

```bat
cd C:\tythys-com-cursor\backend
docker compose up -d db
copy /Y .env.local.parity.example .env
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

## Migration/bootstrap deployment flow

Use this sequence for safe deploys:

1. Set production env vars (especially `DATABASE_URL`, `REQUIRE_DATABASE=true`, `BOOTSTRAP_DB_SCHEMA=false`).
2. Run migrations with Alembic (`alembic upgrade head`).
3. Deploy/restart API service.
4. Verify health and readiness checks.

Important notes:

- Keep `BOOTSTRAP_DB_SCHEMA=false` in production so schema changes only come from Alembic migrations.
- `BOOTSTRAP_DB_SCHEMA=true` is dev/test-only for scratch databases.

## Tests

Core tests:

```bat
cd C:\tythys-com-cursor\backend
call .venv\Scripts\activate.bat
pytest
```

Optional Postgres-backed smoke (hybrid mode parity) requires `TEST_DATABASE_URL`:

```bat
set TEST_DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/revenue_guard
pytest -k postgres_backed
```

## Railway go-live runbook

### 1) Create services

1. Create a Railway project.
2. Add a **Postgres** service.
3. Add a service from this repo with `backend` as root/build context.

### 2) Configure API env vars

Start with `.env.prod.example` values:

- `BACKEND_SERVICE_MODE=production`
- `INGEST_API_KEY=<strong-random-secret>`
- `REQUIRE_DATABASE=true`
- `DATABASE_URL=<Railway Postgres connection string>`
- `BOOTSTRAP_DB_SCHEMA=false`
- optional: `ROLLUP_INTERVAL_SECONDS`, `REVENUE_VALUE_PER_SUCCESS_USD`

### 3) Set start command and health check

- Start command:
  - `uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}`
- Health check path:
  - `/health`

### 4) Run migrations before first traffic

Run with production DB URL:

```bat
cd C:\tythys-com-cursor\backend
call .venv\Scripts\activate.bat
set DATABASE_URL=<production_database_url>
alembic upgrade head
```

### 5) Deploy and verify

Post-deploy checklist:

- `GET /health` returns `200` with `"ok": true`.
- `GET /ready` returns `200` with `"ok": true` and `"db": true`.
- `GET /v1/meta/version` responds successfully.
- ingest smoke:
  - call `POST /v1/ingest/events` with `x-api-key`,
  - call `GET /v1/ingest/events/latest` and confirm events persisted.

### 6) Rollback basics

If deployment is unhealthy:

1. Roll back to the previous Railway deployment.
2. Re-run readiness checks (`/health`, `/ready`).
3. If issue is migration-related, stop forward deploys until DB state is validated.

## Useful endpoints

- `GET /health`
- `GET /ready`
- `GET /v1/meta/version`
- `GET /v1/services/api-gateway-observability/summary`
- `GET /v1/services/anomaly-lens/summary`

## Frontend wiring

- `BACKEND_MODE=real`
- `BACKEND_BASE_URL=http://localhost:8080/v1` (local) or deployed API base URL
