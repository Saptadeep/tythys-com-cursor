from __future__ import annotations

import math
import time
from collections import Counter, defaultdict, deque

from .models import ClientMetric, MetricsResponse, MetricsSummary, NginxEvent, RouteMetric, TimeSeriesMetric

MAX_EVENTS = 10000
WINDOW_SECONDS = 60
MAX_POINTS = 60


class MetricsStore:
    def __init__(self) -> None:
        self.events: deque[NginxEvent] = deque(maxlen=MAX_EVENTS)
        self.timeseries = TimeSeriesMetric()

    def add_event(self, event: NginxEvent) -> None:
        self.events.append(event)

    def add_events(self, events: list[NginxEvent]) -> None:
        for event in events:
            self.add_event(event)

    def snapshot(self) -> MetricsResponse:
        now = time.time()
        window_start = now - WINDOW_SECONDS
        window_events = [event for event in self.events if event.timestamp >= window_start]

        total = len(window_events)
        errors = sum(1 for event in window_events if event.status >= 400)
        latency_values = [event.latency_ms for event in window_events]
        avg_latency = (sum(latency_values) / total) if total else 0.0
        p95_latency = percentile(latency_values, 95) if latency_values else 0.0
        rps = (total / WINDOW_SECONDS) if total else 0.0
        error_rate = ((errors / total) * 100) if total else 0.0

        route_buckets: dict[str, list[NginxEvent]] = defaultdict(list)
        for event in window_events:
            route_buckets[event.path].append(event)

        routes: list[RouteMetric] = []
        for path, events in route_buckets.items():
            route_hits = len(events)
            route_errors = sum(1 for event in events if event.status >= 400)
            route_avg_latency = sum(event.latency_ms for event in events) / route_hits
            routes.append(
                RouteMetric(
                    path=path,
                    hits=route_hits,
                    error_rate=round((route_errors / route_hits) * 100, 2),
                    avg_latency=round(route_avg_latency, 2),
                )
            )
        routes.sort(key=lambda route: route.hits, reverse=True)

        clients_counter = Counter(event.ip for event in window_events)
        clients = [
            ClientMetric(ip=ip, requests=requests)
            for ip, requests in clients_counter.most_common(5)
        ]

        self._append_timeseries(round(rps, 2), round(avg_latency, 2), round(error_rate, 2))

        return MetricsResponse(
            summary=MetricsSummary(
                rps=round(rps, 2),
                total_requests=total,
                error_rate=round(error_rate, 2),
                avg_latency=round(avg_latency, 2),
                p95_latency=round(p95_latency, 2),
            ),
            routes=routes[:10],
            clients=clients,
            timeseries=self.timeseries,
        )

    def _append_timeseries(self, rps: float, latency: float, errors: float) -> None:
        self.timeseries.rps = (self.timeseries.rps + [rps])[-MAX_POINTS:]
        self.timeseries.latency = (self.timeseries.latency + [latency])[-MAX_POINTS:]
        self.timeseries.errors = (self.timeseries.errors + [errors])[-MAX_POINTS:]


def percentile(values: list[float], pct: int) -> float:
    sorted_values = sorted(values)
    if not sorted_values:
        return 0.0

    rank = (pct / 100) * (len(sorted_values) - 1)
    lower = math.floor(rank)
    upper = math.ceil(rank)
    if lower == upper:
        return sorted_values[lower]
    weight = rank - lower
    return sorted_values[lower] * (1 - weight) + sorted_values[upper] * weight
