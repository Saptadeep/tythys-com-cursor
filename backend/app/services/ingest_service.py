from collections import deque
from datetime import datetime
from threading import Lock

from app.schemas.ingest import IngestEvent, IngestEventsRequest, IngestLatestResponse

_MAX_EVENTS = 5000
_LATEST_WINDOW = 20
_MAX_SEEN = 200_000


class InMemoryIngestStore:
    def __init__(self):
        self._events: deque[IngestEvent] = deque(maxlen=_MAX_EVENTS)
        self._service_id: str | None = None
        self._lock = Lock()
        self._seen: set[tuple[str, str]] = set()

    def add_events(self, payload: IngestEventsRequest) -> tuple[int, int, int, int, datetime | None]:
        received = len(payload.events)
        inserted = 0
        skipped = 0
        last_ts = None
        with self._lock:
            self._service_id = payload.service_id
            for ev in payload.events:
                key = (payload.service_id, ev.request_id)
                if key in self._seen:
                    skipped += 1
                    continue
                if len(self._seen) >= _MAX_SEEN:
                    self._seen.clear()
                self._seen.add(key)
                self._events.append(ev)
                inserted += 1
                last_ts = ev.timestamp
            total = len(self._events)
        return received, inserted, skipped, total, last_ts

    def latest(self) -> IngestLatestResponse:
        with self._lock:
            if not self._events:
                return IngestLatestResponse(
                    service_id=self._service_id,
                    total_events=0,
                    last_event_at=None,
                    recent_event_count=0,
                    error_events_last_window=0,
                )

            recent_events = list(self._events)[-_LATEST_WINDOW:]
            return IngestLatestResponse(
                service_id=self._service_id,
                total_events=len(self._events),
                last_event_at=recent_events[-1].timestamp,
                recent_event_count=len(recent_events),
                error_events_last_window=sum(1 for event in recent_events if event.status >= 500),
            )


store = InMemoryIngestStore()
