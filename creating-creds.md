**User**

For the below, I get the keys, now please give me step by step instructions for generating values

---

**Cursor**

Use this exact sequence to generate and set all required values.

## 1) Generate `AUTH_SECRET`

Run locally (or OCI) once:

```bash
openssl rand -base64 32
```

Copy output as `AUTH_SECRET`.

If `openssl` missing, use Node:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 2) Create Google OAuth creds (`AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`)

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create/select project.
3. Enable **Google Identity Services** (OAuth).
4. Go to **APIs & Services → Credentials**.
5. Click **Create Credentials → OAuth client ID**.
6. App type: **Web application**.
7. Add Authorized redirect URI:

- `https://tythys.com/api/auth/callback/google`

(If you use Vercel preview auth too, optionally add that preview domain callback.)
8. Save, then copy:
   - Client ID → `AUTH_GOOGLE_ID`
   - Client Secret → `AUTH_GOOGLE_SECRET`

---

## 3) Create Cloudflare Turnstile keys

1. Go to [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile).
2. Add new site/widget.
3. Domain(s):
   - `tythys.com`
   - `www.tythys.com`
4. Choose managed/non-interactive mode.
5. Save and copy:
   - Site key → `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
   - Secret key → `TURNSTILE_SECRET_KEY`

---

## 4) Set Vercel environment variables

In Vercel project → **Settings → Environment Variables**, add:

- `AUTH_SECRET` = (from step 1)
- `AUTH_GOOGLE_ID` = (from Google)
- `AUTH_GOOGLE_SECRET` = (from Google)
- `AUTH_TRUST_HOST` = `true`
- `NEXTAUTH_URL` = `https://tythys.com`
- `ADMIN_EMAILS` = `sd@tythys.com`
- `NEXT_PUBLIC_SITE_URL` = `https://tythys.com`
- `ALLOWED_ORIGINS` = `https://tythys.com,https://www.tythys.com`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` = (from Turnstile)
- `TURNSTILE_SECRET_KEY` = (from Turnstile)
- Keep existing backend var:
  - `BACKEND_BASE_URL` = `http://192.18.156.255:8000` (your current live setup)

Apply to **Production** (and Preview if you want preview testing).

---

## 5) Redeploy

After saving env vars, trigger a new deploy (or `git push` again).

---

## 6) Verify quickly

- `https://tythys.com/auth/signin` → Google sign-in works
- Sign in as `sd@tythys.com` → `/admin/analytics` accessible
- Non-admin account → blocked from `/admin/analytics`
- Contact form requires Turnstile
- `https://tythys.com/robots.txt`
- `https://tythys.com/sitemap.xml`

If you want, I can give you a checklist format you can tick off live while configuring.

