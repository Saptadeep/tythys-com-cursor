Confirmed: no UI changes needed.

1. User Demo Flow
Use this order in the demo:

Open:
start http://localhost:3000/beam-calculator
Explain the page:
“The tool solves validated simply-supported beam cases. The backend uses closed-form beam formulas; the UI only handles inputs, section presets, charts, validation, and export.”

Show default solve:
Keep units as SI.
Keep default case: Point load at centre.
Click Solve.
Expected key result:

Max deflection ≈ 0.02743902 m
Show section presets:
Change Section model from Custom I + c to:
Rectangle
Circle
W-shape preset
Click Solve after each to show outputs update.
Show load cases:
Change Load case to:

Point load at position
UDL full span
End moment at left support
Click Solve after each.

Show validation:
Example:

Set Span to -1
Click Solve
Expected: inline validation message from backend 422.

Show export:
Restore valid values.
Click Solve.
Click Export PDF.
This opens a print report with inputs, outputs, Roark reference, and charts.

2. Flow Wiring
Current flow is:

Browser
  → /beam-calculator
  → POST /api/beam-calc/solve?units=si
  → Next.js proxy route
  → POST http://localhost:8080/v1/beam-calc/solve
  → FastAPI backend
  → beam_calc solver
  → JSON response
  → UI renders results + charts
Important files:

frontend/src/app/beam-calculator/page.tsx
frontend/src/app/api/beam-calc/solve/route.ts
backend/app/api/routes/beam_calc.py
backend/app/services/beam_calc/solve.py
For the OCI demo, the easiest deployment is both frontend and backend on the same VM:

Next.js frontend: http://<OCI_PUBLIC_IP>:3000
FastAPI backend: http://127.0.0.1:8080
That works because the Next.js API route defaults to:

BACKEND_BASE_URL=http://localhost:8080
So do not set BACKEND_BASE_URL unless needed.

3. Local Pre-Push Checks
Run from Windows CMD:

cd /d C:\tythys-com-cursor\backend
.venv\Scripts\python -m pytest tests\test_beam_calc.py tests\test_beam_calc_api.py -q
Expected:

35 passed
Then:

cd /d C:\tythys-com-cursor\frontend
npm test
Expected:

Test Files  1 passed (1)
Tests       1 passed (1)
Commit and push:

cd /d C:\tythys-com-cursor
git status
git add docs\SESSION_HANDOFF.md ^
        docs\products\engineer-calc\03-ui-design.md ^
        frontend\package.json ^
        frontend\package-lock.json ^
        frontend\next-env.d.ts ^
        frontend\src\app\beam-calculator\page.tsx ^
        frontend\tests\beam-calculator.test.tsx ^
        frontend\tests\setup.ts ^
        frontend\vitest.config.mts
git rm frontend\playwright.config.ts frontend\tests\beam-calculator.spec.ts
git commit -m "Complete EngineerCalc Week 5 polish: section presets, PDF export, inline validation, and Vitest smoke gate" -m "Playwright removed due to local Windows hangs; replaced with Vitest + RTL component smoke test." -m "Adds deterministic canonical centre-load smoke assertion (~0.02743902) and updates SESSION_HANDOFF with the new CMD test flow."
git push origin HEAD
4. OCI Cloud Deployment Steps
From Windows CMD, SSH into your OCI Ubuntu VM:

ssh ubuntu@<OCI_PUBLIC_IP>
On the OCI VM:

sudo apt update
sudo apt install -y git curl python3.12 python3.12-venv python3-pip nginx
Install Node 20+:

curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
Clone or update the repo:

cd ~
git clone <YOUR_GIT_REPO_URL> tythys-com-cursor
cd ~/tythys-com-cursor
If already cloned:

cd ~/tythys-com-cursor
git pull
Backend setup:

cd ~/tythys-com-cursor/backend
python3.12 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
cp .env.local.quick.example .env
Run backend test gate:

. .venv/bin/activate
python -m pytest tests/test_beam_calc.py tests/test_beam_calc_api.py -q
Start backend:

cd ~/tythys-com-cursor/backend
. .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8080
Open a second SSH session, then setup frontend:

cd ~/tythys-com-cursor/frontend
npm install
npm test
npm run build
Start frontend:

cd ~/tythys-com-cursor/frontend
npm run dev -- --hostname 0.0.0.0 --port 3000
Now open in browser:

http://<OCI_PUBLIC_IP>:3000/beam-calculator
For a quick demo, OCI Security List / Network Security Group must allow inbound:

TCP 22    SSH
TCP 3000  Frontend demo
TCP 8080  Optional backend direct testing
Backend direct smoke from your Windows CMD:

curl -X POST http://<OCI_PUBLIC_IP>:8080/v1/beam-calc/solve ^
  -H "Content-Type: application/json" ^
  -d "{\"length_m\":6.0,\"material\":{\"name\":\"Steel A36\",\"youngs_modulus_pa\":200e9},\"section\":{\"shape\":\"custom\",\"second_moment_m4\":8.2e-6,\"label\":\"Test\"},\"load\":{\"kind\":\"point_load_centre\",\"magnitude_n\":10000.0},\"sample_points\":51}"
Expected response includes:

0.02743902439024390
For the live demo, use only:


http://<OCI_PUBLIC_IP>:3000/beam-calculator