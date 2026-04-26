# Architecture Guide

## Objective

Provide a production-grade, maintainable frontend foundation that can evolve from mocked workflows to real API-backed modules without redesigning the core shell.

## Layers

- `types`: canonical domain contracts (`MetricsResponse`, `AppState`)
- `services`: API boundary, request shaping, and mock/real provider swap points
- `store`: app-wide asynchronous state and polling orchestration
- `components`: reusable UI units grouped by domain (`dashboard`, `layout`)
- `pages`: route-level composition and module placeholders
- `app`: router and composition root

## Data flow

1. `AppStateProvider` mounts.
2. `refresh()` dispatches `FETCH_START`.
3. `fetchMetrics()` resolves data (currently mocked).
4. `FETCH_SUCCESS` stores payload in global state.
5. Polling timer triggers every 3s.
6. Charts and tables consume reactive state.

## Dashboard composition

- `DashboardPage` orchestrates all dashboard widgets.
- `TopMetricsBar` handles threshold coloring:
  - error rate > 5 -> critical
  - p95 latency > 300ms -> warning
- `ThroughputChart` and `LatencyChart` render timeseries.
- `RouteTable` supports click-based sorting.
- `LiveStreamPanel` derives log lines from route metrics.

## Responsiveness contract

- Desktop (`>=1280px`): Sidebar + Main + Right stream panel
- Tablet: compact sidebar + Main, stream panel hidden
- Mobile: single-column layout with compact nav strip

## Branding/HUD/footer placeholders

Current placeholders are intentionally explicit in `AppFrame` to keep white-labeling and productization low risk:
- brand block
- HUD note area
- footer utility area

Replace placeholder content with real components rather than modifying routing/state foundations.
