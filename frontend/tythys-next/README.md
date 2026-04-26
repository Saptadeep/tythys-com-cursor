# Tythys Platform — Next.js App

## Stack

| Layer      | Technology                         |
|------------|-------------------------------------|
| Framework  | Next.js 14 (App Router)            |
| Styling    | Tailwind CSS v3                    |
| Animation  | Framer Motion                      |
| Icons      | Lucide React                       |
| UI Radix   | Radix UI (Dialog, Tooltip)         |
| Language   | TypeScript                         |
| Hosting    | Vercel (free tier)                 |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          ← Root layout, fonts, metadata
│   ├── page.tsx            ← Home page (assembles sections)
│   └── globals.css         ← Design tokens + Tailwind base
│
├── components/
│   ├── layout/
│   │   ├── TopBar.tsx      ← Animated heartbeat header bar
│   │   ├── Navbar.tsx      ← Glassmorphic navigation
│   │   └── Footer.tsx
│   │
│   ├── sections/
│   │   ├── Hero.tsx        ← Full-viewport hero
│   │   ├── Products.tsx    ← Service cards grid
│   │   ├── Process.tsx     ← Methodology steps
│   │   ├── About.tsx       ← About + equation panel
│   │   └── Contact.tsx     ← Contact form with state
│   │
│   ├── hud/
│   │   └── HUD.tsx         ← Floating HUD with heartbeat monitor
│   │
│   └── ui/
│       └── ParticleCanvas.tsx
│
├── config/
│   └── services.ts         ← ★ THE PLUG-IN REGISTRY — edit here
│
├── types/
│   └── index.ts            ← All TypeScript types
│
├── hooks/
│   └── useScrollReveal.ts
│
└── lib/
    └── cn.ts               ← Tailwind class merge utility
```

---

## Adding a New Service (Plug-and-Play)

Open `src/config/services.ts` and add one object to `SERVICES`:

```typescript
{
  id:          'compliance-checker',
  name:        'ComplianceAI',
  tagline:     'Automated regulatory compliance checks',
  description: 'Upload a document, get a compliance report against GDPR, ISO 27001, or custom rule sets.',
  category:    'Compliance & Law',
  status:      'soon',
  icon:        '⚖️',
  accentColor: '#00cfff',
  price:       'From $49 / mo',
  href:        '/compliance',      // ← create this page when ready
  mathDomain:  ['Statistics'],
},
```

**That is all.** The card appears in the grid, the contact form option appears, and the HUD service list updates — all automatically.

---

## Running Locally

```bash
npm install
npm run dev
# → http://localhost:3000
```

---

## Deploying to Vercel (Free)

```bash
# 1. Push your repo to GitHub

# 2. Go to vercel.com → New Project → Import your repo

# 3. Framework preset: Next.js (auto-detected)

# 4. Click Deploy — live in ~90 seconds

# 5. Add custom domain in Vercel dashboard:
#    Settings → Domains → Add → tythys.com
#    Then add DNS records at your registrar:
#      Type   Name   Value
#      A      @      76.76.21.21
#      CNAME  www    cname.vercel-dns.com
```

Vercel free tier includes: unlimited deployments, automatic HTTPS, global CDN, 100GB bandwidth/month.

---

## Connecting the Python API

In `src/config/services.ts`, add `apiEndpoint` to any service:

```typescript
apiEndpoint: 'https://tythys-api.onrender.com/api/beam-deflection',
```

Then in the tool page (`src/app/beam-calculator/page.tsx`), call it via `fetch()`.

---

## Colour System (Tailwind tokens)

All design tokens are in `tailwind.config.js`:

```
accent   #00e5b8   Primary teal
gold     #ffcb47   Highlights / prices
purple   #8b7fff   Engineering category
pink     #ff6b9d   EdTech category
cyan     #00cfff   ML/Analytics category
dim      #7a8a9e   Secondary text
```

State colours:
```
state-idle      #7a8a9e   Grey — waiting
state-loading   #ffaa33   Amber — processing
state-ready     #00e5b8   Teal — success / healthy
state-error     #ff5f5f   Red — failure
```

---

## HUD Heartbeat Monitor

The `HUD` component (`src/components/hud/HUD.tsx`):
- Renders a canvas-based ECG waveform with real-time animation
- Shows colour-coded service health dots (healthy / degraded / down)
- Displays uptime counter (resets on page load)
- Shows simulated API latency with jitter
- Collapses to a small tab — expands on click
- Border colour changes to match overall platform health state

To connect real health data, replace the mock `services` array in `HUD.tsx` with a `fetch()` call to your API's `/health` endpoint.

---

## TopBar Heartbeat

The `TopBar` component animates an ECG-like SVG waveform that scrolls continuously. It has three health states (healthy / degraded / down) that change the gradient colours of the bar and the ECG line colour. Wire it to real data by calling your API's health endpoint on an interval.
