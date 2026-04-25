from collections import deque
from threading import Lock

from app.schemas.ingest import IngestEvent, IngestEventsRequest, IngestLatestResponse

_MAX_EVENTS = 5000
_LATEST_WINDOW = 20


class InMemoryIngestStore:
    def __init__(self):
        self._events: deque[IngestEvent] = deque(maxlen=_MAX_EVENTS)
        self._service_id: str | None = None
        self._lock = Lock()

    def add_events(self, payload: IngestEventsRequest) -> int:
        with self._lock:
            self._service_id = payload.service_id
            self._events.extend(payload.events)
            return len(self._events)

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
