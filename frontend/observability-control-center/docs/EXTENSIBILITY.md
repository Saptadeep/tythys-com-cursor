# Extensibility Playbook

## 1) Replacing mocked metrics API

Current metrics data is generated in `src/services/metricsService.ts`.

Recommended migration:

1. Keep `MetricsResponse` in `src/types/metrics.ts` as the contract source of truth.
2. Replace `fetchMetrics()` implementation with real network call:
   - `GET /metrics`
   - validate response shape before storing
3. Keep provider contract unchanged (`refresh()` in store layer) so UI remains stable.

## 2) Adding a new API service module

Pattern:

- Add contract in `src/types`
- Add service in `src/services`
- Add route page in `src/pages`
- Add navigation entry in `AppFrame`
- If shared state required, extend `AppState` and reducer actions

## 3) Adding Contact Form module (future)

Current route: `/contact` placeholder.

Enhancement checklist:

- form schema and validation
- server action or REST endpoint wiring
- success/error UX state
- spam/rate limiting indicators
- audit event hooks

## 4) Adding User Creation module (future)

Current route: `/users/new` placeholder.

Enhancement checklist:

- RBAC-aware field rendering
- org/team assignment flow
- invite email API integration
- optimistic UI plus rollback handling

## 5) Adding Authentication module (future)

Current route: `/auth/login` placeholder.

Enhancement checklist:

- auth provider adapter (OIDC/SAML/password)
- token lifecycle handling
- protected route wrappers
- session refresh and logout propagation

## 6) Theming and branding

All major palette and UI tokens are in `src/index.css`:
- state tones (`--color-cyan`, `--color-amber`, `--color-red`)
- panel shadows, borders, and gradients

Brand strategy:

- keep design tokens centralized
- replace `AppFrame` placeholder blocks with real brand/HUD/footer components
- avoid coupling business logic to visual theming

## 7) Quality gates for enterprise growth

- add API schema validation (e.g. zod) before store updates
- add unit tests for store reducer and service adapters
- add integration tests for key routes and role-based navigation
- add feature-flag layer before rolling out new modules
