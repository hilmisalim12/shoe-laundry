# Shoe Laundry — Web App

Web-first shoe cleaning service with **Customer** booking/tracking and **Admin** business management.

## Stack

- Expo SDK 56 + React Native Web + TypeScript
- Expo Router (web primary)
- Zustand + AsyncStorage
- Supabase (optional — runs locally without config)

## Quick start

```bash
cd shoe-laundry
npm install
npm run web
```

Open the app in your browser. No Supabase setup required for local demo.

### Demo accounts (local mode)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@shoelaundry.com | admin123 |

Register a new customer account from the sign-up screen.

## Supabase setup (production)

### 1. Create a Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Copy from **Settings → API**:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon public key** → `EXPO_PUBLIC_SUPABASE_ANON_KEY`
3. Copy from **Settings → Database → Connection string (URI, Session pooler)**:
   - → `SUPABASE_DB_URL`

### 2. Configure locally

```bash
cp .env.example .env
# Fill in EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_DB_URL
npm run db:setup    # creates tables, RLS, seed services
```

### 3. Create admin user

1. Start the app and **register** your admin email via Create account
2. In Supabase **SQL Editor**, run:

```sql
update profiles set role = 'admin' where email = 'your@email.com';
```

### 4. Push to Vercel

```bash
npm run env:vercel   # pushes EXPO_PUBLIC_* from .env to Vercel
npx vercel --prod    # redeploy with database connected
```

Or add the two `EXPO_PUBLIC_*` vars manually in [Vercel project settings](https://vercel.com) and redeploy.

**Auth tip:** In Supabase → Authentication → Providers → Email, disable **Confirm email** for faster sign-up during testing.

## Features

### Customer
- Browse services
- 3-step booking (service → logistics → review)
- Pickup/delivery or shop drop-off
- Cash payment (pay at pickup/drop-off/delivery)
- Order tracking timeline

### Admin
- Dashboard KPIs (orders, cash collected, unpaid)
- Order management + status updates
- **Confirm cash payment** (amount + note)
- Services catalog CRUD
- Customer list

## Payments

MVP uses **cash only**. Admin confirms payment on the order detail screen. Midtrans online payments are planned for a future release.

## Deploy to the web (make it live)

The app exports as a **static website** (`dist/`). Pick one option below.

### Before you go live (important)

**Local demo mode** stores data in each visitor’s browser only. For a real business where customers and admin share orders, set up **Supabase** first:

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL editor
3. Copy `.env.example` → `.env` and add your keys
4. Promote an admin: `update profiles set role = 'admin' where email = 'your@email.com';`
5. Add the same env vars on your host (see each platform below)

Build env vars (required for Supabase in production):

| Variable | Example |
|----------|---------|
| `EXPO_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` |

Build locally to test:

```bash
cd shoe-laundry
npm install
npm run build:web
npm run preview:web   # opens dist/ at http://localhost:3000
```

---

### Option A — Vercel (recommended, free)

1. Push `shoe-laundry` to GitHub (new repo or subfolder)
2. Go to [vercel.com/new](https://vercel.com/new) → Import repo
3. Set **Root Directory** to `shoe-laundry` if the repo is the parent folder
4. Add environment variables (`EXPO_PUBLIC_SUPABASE_*`) in Project Settings → Environment Variables
5. Deploy — Vercel uses `vercel.json` automatically

Or from the terminal (after `npm i -g vercel` and `vercel login`):

```bash
cd shoe-laundry
vercel --prod
```

---

### Option B — Netlify (free)

1. Push to GitHub
2. [app.netlify.com](https://app.netlify.com) → Add new site → Import from Git
3. Base directory: `shoe-laundry` (if needed)
4. Build command: `npm run build:web` · Publish directory: `dist`
5. Site settings → Environment variables → add Supabase keys
6. Deploy

CLI:

```bash
cd shoe-laundry
npm run build:web
npx netlify deploy --prod --dir=dist
```

---

### Option C — cPanel / shared hosting (FTP)

1. On your computer: `npm run build:web`
2. Upload **everything inside** `dist/` to `public_html/` (or your web root)
3. Ensure `.htaccess` from `public/` was copied (Expo includes `public/` in the export)
4. Visit your domain

> Without Supabase, each browser has its own isolated data. Use Supabase for production.

---

### Option D — Cloudflare Pages

1. Connect GitHub repo
2. Build command: `npm run build:web`
3. Build output directory: `dist`
4. Add `EXPO_PUBLIC_*` environment variables
5. Deploy

