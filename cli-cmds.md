cd /d C:\tythys-com-cursor\backend
.venv\Scripts\activate
uvicorn app.main:app --host 0.0.0.0 --port 8080

curl http://localhost:8080/health
curl http://localhost:8080/v1/services/api-gateway-observability/summary


# Docker lifesavers:
alembic upgrade head
remove all others except Administrators on Windows 11, you can do it either
takeown /F "C:\ProgramData\DockerDesktop" /R /D Y
icacls "C:\ProgramData\DockerDesktop" /setowner "Administrators" /T
icacls "C:\ProgramData\DockerDesktop" /reset /T
icacls "C:\ProgramData\DockerDesktop" /grant Administrators:F /T

icacls "C:\ProgramData\DockerDesktop"
You should see only:
BUILTIN\Administrators:(F)

If Docker still complains, you may need to re‑add SYSTEM with full control:
icacls "C:\ProgramData\DockerDesktop" /grant SYSTEM:F /T

Remove all other permissions and keep only Administrators + SYSTEM:
1. run in an elevated Command Prompt (Run as Administrator)
2. takeown /F "C:\ProgramData\DockerDesktop" /R /D Y
3. icacls "C:\ProgramData\DockerDesktop" /setowner "Administrators" /T
4. icacls "C:\ProgramData\DockerDesktop" /reset /T
5. icacls "C:\ProgramData\DockerDesktop" /grant Administrators:F /T
6. icacls "C:\ProgramData\DockerDesktop" /grant SYSTEM:F /T

icacls "C:\ProgramData\DockerDesktop"
You should see only:
BUILTIN\Administrators:(F)
NT AUTHORITY\SYSTEM:(F)