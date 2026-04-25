@echo off
setlocal

set ROOT=C:\tythys-com-cursor
set BACKEND=%ROOT%\backend
set FRONTEND=%ROOT%\frontend

if not exist "%BACKEND%\app\main.py" (
  echo [ERROR] Backend not found at "%BACKEND%".
  exit /b 1
)

if not exist "%FRONTEND%\package.json" (
  echo [ERROR] Frontend not found at "%FRONTEND%".
  exit /b 1
)

if not exist "%BACKEND%\.venv\Scripts\python.exe" (
  echo [ERROR] Backend virtual environment missing: "%BACKEND%\.venv"
  echo Create it first:
  echo   cd /d %BACKEND%
  echo   py -3.13 -m venv .venv
  echo   .venv\Scripts\python.exe -m pip install -r requirements.txt
  exit /b 1
)

echo Starting backend in a new CMD window...
start "TYTHYS BACKEND" cmd /k "cd /d %BACKEND% && .venv\Scripts\activate.bat && python -m uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload"

echo Starting frontend in a new CMD window...
start "TYTHYS FRONTEND" cmd /k "cd /d %FRONTEND% && npm run dev"

echo.
echo Dev servers launched:
echo   Backend : http://localhost:8080/health
echo   Frontend: http://localhost:3000
echo.
echo Press any key to close this launcher...
pause >nul
