# Observability Control Center Frontend

Industry-grade, extension-ready React + TypeScript frontend for monitoring traffic, latency, and errors from `GET /metrics`, with mock-ready module routes for:
- contact form
- user creation
- user authentication

## Why this theme

This implementation is built as an **Operations / Observability Control Center** because your spec centers on throughput, latency, route behavior, and live request streams.  
The UI intentionally uses placeholder branding, HUD, and footer blocks so teams can white-label and expand quickly.

## Implemented from spec

- `GET /metrics` response contract implemented in `src/types/metrics.ts`
- Global state (`metrics`, `loading`, `error`) in `src/store/AppStateContext.tsx`
- Fetch cycle on mount and refresh every 3s
- Timeseries retention: last 60 points
- Dashboard component tree:
  - `DashboardPage`
  - `TopMetricsBar`
  - `ThroughputChart`
  - `LatencyChart`
  - `RouteTable` (sortable + highlight)
  - `LiveStreamPanel`
- Responsive behavior:
  - Desktop: Sidebar + Main + Right panel
  - Tablet: collapsed sidebar + Main
  - Mobile: main-first with compact navigation rail
- UI rules:
  - truncation utility `.truncate`
  - hover lift for cards
  - state tones: cyan (normal), amber (warning), red (critical)

## Mocked extension routes

- `/contact` (contact form module placeholder)
- `/users/new` (user creation module placeholder)
- `/auth/login` (authentication module placeholder)

## Run locally

```bash
npm install
npm run dev
```

### Use real backend metrics (optional)

1. Start backend service:
   - see `backend/README.md`
2. Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

3. Restart frontend dev server.

Build and lint:

```bash
npm run build
npm run lint
```

## Project structure

```text
src/
  app/                # App router and top-level composition
  components/
    dashboard/        # Spec-driven dashboard widgets
    layout/           # Sidebar, shell, footer placeholders
  pages/              # Route screens (dashboard + mocked module pages)
  services/           # API service contracts + mocked endpoint behavior
  store/              # Global app state and polling cycle
  types/              # Domain contracts
```

## Customization and module growth

Read:
- `docs/ARCHITECTURE.md`
- `docs/EXTENSIBILITY.md`

Both documents include conventions for adding new services, replacing mocks with real APIs, adding route modules, and branding/HUD/footer customization safely.
