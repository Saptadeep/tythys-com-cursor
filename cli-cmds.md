cd /d C:\tythys-com-cursor\backend
.venv\Scripts\activate
uvicorn app.main:app --host 0.0.0.0 --port 8080

curl http://localhost:8080/health
curl http://localhost:8080/v1/services/api-gateway-observability/summary