# API Reliability Copilot Backend

Gateway-agnostic backend service (NGINX first) for route reliability metrics.

## MVP capabilities

- Parse NGINX access lines
- Ingest one line or batch
- Aggregate last 60s metrics in memory
- Expose frontend-compatible `GET /metrics`

## Run

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Endpoints

- `GET /health`
- `GET /metrics`
- `POST /ingest/nginx-line`
- `POST /ingest/nginx-batch`

## Sample ingest payload

```json
{
  "line": "127.0.0.1 - - [24/Apr/2026:17:40:10 +0000] \"GET /api/v1/users HTTP/1.1\" 200 523 \"-\" \"curl/8.0\" 0.142"
}
```

## Replay an existing access log

```bash
python backend/scripts/replay_nginx_log.py --file /path/to/access.log --api http://localhost:8000
```
