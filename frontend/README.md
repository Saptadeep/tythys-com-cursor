# TythysOne Frontend

## Run locally (CMD)

```cmd
cd C:\tythys-com-cursor\frontend
npm install
copy .env.example .env.local
npm run dev
```

## Backend mode

- `BACKEND_MODE=mock` uses local mock data
- `BACKEND_MODE=real` calls backend using `BACKEND_BASE_URL`

Expected backend URL in real mode:

- `http://localhost:8080/v1`

## UI architecture and extension docs

- `c:\tythys-com-cursor\docs\PRODUCT_UI_ARCHITECTURE.md`
- `c:\tythys-com-cursor\docs\CUSTOMIZATION_AND_EXTENSION_GUIDE.md`
