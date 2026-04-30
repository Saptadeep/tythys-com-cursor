# EngineerCalc Week 6 - Soft Launch Runbook

Last updated: 2026-04-30

## 1) Launch Envelope (Week 6)

- Public page stays live: `https://tythys.com/beam-calculator`
- Pricing narrative is public at `https://tythys.com/pricing`
- Free tier remains default during soft launch:
  - Unlimited single-load solves
  - Section presets + custom section inputs
  - Export includes a watermark
- Pro/API are handled as waitlist-first until usage and reliability are validated.

## 2) Environment Parity Checklist (Vercel + OCI)

Frontend (Vercel) required environment:

- `BACKEND_BASE_URL=https://<oci-host-or-ip>:8080` or `https://<oci-host-or-ip>:8080/v1`
  - The Next.js proxy auto-normalizes `/v1` to avoid accidental `/v1/v1`.
- `BACKEND_MODE=live`
- `INGEST_API_KEY=<prod-ingest-key>` (only for ingest routes that require auth)

Backend (OCI) required environment:

- `REQUIRE_DATABASE=<true|false>` set explicitly for deployment profile
- `DATABASE_URL=<postgres-url>` only when DB-backed mode is enabled
- service must expose:
  - `GET /health`
  - `GET /ready`
  - `POST /v1/beam-calc/solve`

## 3) Pre-Deploy Local Gates (must be green)

From `C:\tythys-com-cursor\backend`:

```cmd
.venv\Scripts\python -m pytest tests\test_beam_calc.py tests\test_beam_calc_api.py -v
```

Expected: `35 passed`

From `C:\tythys-com-cursor\frontend`:

```cmd
npm test
npm run build
```

Expected:
- Vitest: `1 passed (1)`
- Next build succeeds and includes `/beam-calculator` + `/api/beam-calc/solve`

## 4) Post-Deploy Smoke Sequence (live)

1) Frontend health path:

```cmd
curl https://tythys.com/
```

2) Backend liveness and readiness:

```cmd
curl http://<oci-host-or-ip>:8080/health
curl http://<oci-host-or-ip>:8080/ready
```

3) Backend direct beam solve:

```cmd
curl -X POST http://<oci-host-or-ip>:8080/v1/beam-calc/solve ^
  -H "Content-Type: application/json" ^
  -d "{\"length_m\":6.0,\"material\":{\"name\":\"Steel A36\",\"youngs_modulus_pa\":200e9},\"section\":{\"shape\":\"custom\",\"second_moment_m4\":8.2e-6,\"label\":\"Test\"},\"load\":{\"kind\":\"point_load_centre\",\"magnitude_n\":10000.0},\"sample_points\":51}"
```

Expected `max_deflection_m` near `0.02743902439024390`.

4) Frontend proxy beam solve:

```cmd
curl -X POST https://tythys.com/api/beam-calc/solve ^
  -H "Content-Type: application/json" ^
  -d "{\"length_m\":6.0,\"material\":{\"name\":\"Steel A36\",\"youngs_modulus_pa\":200e9},\"section\":{\"shape\":\"custom\",\"second_moment_m4\":8.2e-6,\"label\":\"Test\"},\"load\":{\"kind\":\"point_load_centre\",\"magnitude_n\":10000.0},\"sample_points\":51}"
```

Expected wrapper: `{"ok":true,"data":{...}}`.

## 5) Rollback Checks

If smoke fails:

1. Confirm `BACKEND_BASE_URL` and `/v1` normalization first.
2. Re-check OCI service is listening on `0.0.0.0:8080`.
3. Revert Vercel env to last known good values and redeploy.
4. Re-run smoke sequence before reopening traffic announcements.

## 6) Interview Script (first 5 users)

Ask each user to do one solve in SI and one in imperial:

1. "What result were you trying to get quickly?"
2. "Did unit inputs/outputs match your expectation?"
3. "Which section option felt most natural?"
4. "Was any validation error unclear?"
5. "Was the PDF export usable in your workflow?"
6. "What would make you pay for Pro/API?"

Capture immediately after each interview:

- time-to-first-correct-solve
- confusion points by screen section
- units/presets/export friction
- requested missing load cases
