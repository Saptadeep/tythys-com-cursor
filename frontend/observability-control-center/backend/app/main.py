from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .models import IngestBatchRequest, IngestLineRequest
from .parser import parse_nginx_access_line
from .store import MetricsStore

app = FastAPI(title="API Reliability Copilot Service", version="0.1.0")
store = MetricsStore()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/metrics")
def get_metrics():
    return store.snapshot()


@app.post("/ingest/nginx-line")
def ingest_nginx_line(payload: IngestLineRequest):
    event = parse_nginx_access_line(payload.line)
    if event:
        store.add_event(event)
        return {"ingested": 1}
    return {"ingested": 0, "reason": "line did not match parser"}


@app.post("/ingest/nginx-batch")
def ingest_nginx_batch(payload: IngestBatchRequest):
    parsed = [event for line in payload.lines if (event := parse_nginx_access_line(line))]
    store.add_events(parsed)
    return {"received": len(payload.lines), "ingested": len(parsed)}
