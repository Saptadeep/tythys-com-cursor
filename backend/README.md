# Tythys API Revenue Guard Backend

## Run locally (PowerShell)

```powershell
cd C:\tythys-com-cursor\backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

## Endpoints

- `GET /health`
- `GET /v1/services/api-gateway-observability/summary`
- `GET /v1/services/anomaly-lens/summary`

## Next step

Wire frontend env:

- `BACKEND_MODE=real`
- `BACKEND_BASE_URL=http://localhost:8080/v1`
