# GoRASA — Configuration Reference

> **Generated:** 2026-06-09  
> **Repository:** `/home/nikhil/Downloads/Gorasa/App-1/rasa-zero-app-main`  
> **Remote:** `nikgorasa/gorasav1` (push target: `neworigin`)  
> **Purpose:** Single source of truth — every config, token, project ID, and agent instruction in one place.

---

## Quick Reference (Critical Values)

| What | Value | Where Defined |
|------|-------|---------------|
| **Supabase Project Ref** | `isubgeemvhvhnhikxbjb` | opencode.jsonc, .env.local |
| **Supabase URL** | `https://isubgeemvhvhnhikxbjb.supabase.co` | `.env.local` |
| **Supabase MCP** | Global opencode config (not in repo `.mcp.json`) | `~/.config/opencode/opencode.jsonc` |
| **Vercel Project Name** | `gorasa-next` | `.vercel/project.json` |
| **Vercel Project ID** | `prj_WLoI80KaCmVZSudP17ohcPbzTpSe` | `.vercel/project.json` |
| **Vercel Team ID** | `team_0pR3Xnbjx12q8H8pZF9xgE5S` | `.vercel/project.json` |
| **Vercel Root Directory** | **`gorasa-next/`** (currently broken — set to `.`) | Needs `vercel.json` at root |
| **Vercel Env: TBO_FORCE_MOCK** | `true` (set to force mock data) | Vercel dashboard |
| **Deploy target** | `git push neworigin main` → Vercel auto-deploy | Vercel Git integration |
| **Git remote (deploy)** | `neworigin → https://github.com/nikgorasa/gorasav1.git` | `git remote -v` |
| **Git remote (origin)** | `origin → https://github.com/nikjp2021/gorasa-app.git` | `git remote -v` |
| **App working directory** | `gorasa-next/` (NOT repo root) | All `npm`/`next` commands |
| **Node version** | 24.x (Vercel), 24.15.0 (local) | No `.nvmrc` |
| **Render MCP token** | In `.mcp.json` (gitignored) | Repo root `.mcp.json` |
| **Env vars file** | `gorasa-next/.env.local` (gitignored) | Contains Supabase + TBO creds |

---

## Table of Contents

1. [Quick Reference](#quick-reference-critical-values)
2. [MCP & Agent Tools Configuration](#2-mcp--agent-tools-configuration)
3. [Vercel Deployment Pipeline](#3-vercel-deployment-pipeline)
4. [Environment Variables Source Map](#4-environment-variables-source-map)
5. [Agent Session Checklist](#5-agent-session-checklist)
6. [Project Overview](#6-project-overview)
7. [Project Structure](#7-project-structure)
8. [Git Setup](#8-git-setup)
9. [Supabase Configuration](#9-supabase-configuration)
10. [Database Schema](#10-database-schema)
11. [Build Configuration](#11-build-configuration)
12. [API Routes — gorasa-next](#12-api-routes--gorasa-next)
13. [TBO Integration](#13-tbo-integration)
14. [Authentication System](#14-authentication-system)
15. [App Pages](#15-app-pages)
16. [Admin Panel](#16-admin-panel)
17. [Legacy Code (packages/)](#17-legacy-code-packages)
18. [Seed Data & Demo Users](#18-seed-data--demo-users)
19. [Key Architectural Notes](#19-key-architectural-notes)

---

## 2. MCP & Agent Tools Configuration

### Where MCP Servers Are Defined

There are **two** MCP configuration locations — agents must check both:

#### A) Global Opencode Config (`~/.config/opencode/opencode.jsonc`)

This is the **global** configuration for the opencode agent framework. It defines:

```json
{
  "mcp": {
    "supabase": {
      "type": "remote",
      "url": "https://mcp.supabase.com/mcp?project_ref=isubgeemvhvhnhikxbjb",
      "enabled": true
    }
  }
}
```

**Supabase MCP** — connects to the Supabase project `isubgeemvhvhnhikxbjb`. This is what gives the agent access to:
- `supabase_execute_sql` — run raw SQL queries
- `supabase_apply_migration` — DDL operations
- `supabase_list_tables` — list tables and schemas
- `supabase_get_logs` — fetch logs
- All other `supabase_*` tools

> **Important:** This is configured at the GLOBAL level (`~/.config/opencode/opencode.jsonc`), not in any repo-level file. Do NOT look for it in `.mcp.json` or the project directory.

#### B) Repo-level MCP Config (`.mcp.json` at repo root)

```json
{
  "mcpServers": {
    "render": {
      "type": "remote",
      "url": "https://mcp.render.com/mcp",
      "headers": {
        "Authorization": "Bearer rnd_EgwXM8hpMQ8N8tYlrzNnGA5RGrRy"
      }
    }
  }
}
```

**Render MCP** — connects to Render's MCP server. Render is used for deploying the **legacy** Express backend (`packages/backend/`).

> **Note:** This file is in `.gitignore`, so the Render token is NOT committed to git.

### What MCP Tools Are Available

| Tool Set | Source | Purpose |
|----------|--------|---------|
| `supabase_*` (e.g., `supabase_execute_sql`) | `~/.config/opencode/opencode.jsonc` | Database queries, migrations, schema inspection |
| `render_*` (if any) | `.mcp.json` (repo root) | Legacy backend deploys |

### How Agents Should Use MCP Tools

**To query the database:**
```
Use the supabase_execute_sql tool with a SQL query.
```

**To apply a migration:**
```
Use the supabase_apply_migration tool with the migration name and SQL.
```

**To check tables:**
```
Use the supabase_list_tables tool.
```

**To check for security/performance issues:**
```
Use the supabase_get_advisors tool.
```

---

## 3. Vercel Deployment Pipeline

### Architecture

- **Repo:** `nikgorasa/gorasav1` → connected to Vercel via Git integration
- **Trigger:** `git push neworigin main` → Vercel auto-deploys
- **Project:** `gorasa-next` (ID: `prj_WLoI80KaCmVZSudP17ohcPbzTpSe`)
- **Team:** `nikhil-gorasa-s-projects` (ID: `team_0pR3Xnbjx12q8H8pZF9xgE5S`)

### CURRENT ISSUE — Deployments Are Failing

**Problem:** The `gorasa-next` Vercel project has its **Root Directory** set to `.` instead of `gorasa-next/`. The root `package.json` is a monorepo workspace and does NOT have `next` as a dependency, so Vercel fails with:

```
Error: No Next.js version detected.
```

**Root cause:** A root `vercel.json` with `rootDirectory: "gorasa-next"` was deleted in commit `56bd759`. The dashboard setting got reset to `.` afterward.

**Fix (not yet applied):**
```bash
# Create root vercel.json (declarative — survives resets)
echo '{"rootDirectory": "gorasa-next"}' > /home/nikhil/Downloads/Gorasa/App-1/rasa-zero-app-main/vercel.json
git add vercel.json && git commit -m "fix: set rootDirectory to gorasa-next"
git push neworigin main
```

**Also:** There's a **second** Vercel project (`rasa-zero-app-main`) connected to the same repo. It should be deleted to stop duplicate failing builds.

### How to Deploy

**Option A — Push to GitHub (auto-deploy):**
```bash
cd /home/nikhil/Downloads/Gorasa/App-1/rasa-zero-app-main
git add <files>
git commit -m "message"
git push neworigin main
```

**Option B — Vercel CLI (direct deploy):**
```bash
cd /home/nikhil/Downloads/Gorasa/App-1/rasa-zero-app-main/gorasa-next
npx vercel --prod --yes
```

### Build Command

The `gorasa-next/vercel.json` defines:
```json
{
  "buildCommand": "npx prisma generate && npx next build"
}
```

This means:
1. `npx prisma generate` — generates Prisma client (needs `DATABASE_URL` env var)
2. `npx next build` — builds the Next.js app

### Vercel Environment Variables

The following are set in Vercel dashboard (Production + Development):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `DIRECT_URL`
- `TBO_USERNAME`
- `TBO_PASSWORD`
- `TBO_FORCE_MOCK` (set to `true` to force mock data)
- `TBO_ENDPOINT`

---

## 4. Environment Variables Source Map

| Variable | `.env.local` | Vercel Prod | Vercel Dev | Purpose |
|----------|:---:|:---:|:---:|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ | ✅ | Client-side Supabase key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | ✅ | ✅ | Admin DB access |
| `DATABASE_URL` | ✅ | ✅ | ✅ | Prisma pooled connection |
| `DIRECT_URL` | ✅ | ✅ | ✅ | Prisma direct connection |
| `TBO_USERNAME` | ✅ | ✅ | ✅ | TBO API login |
| `TBO_PASSWORD` | ✅ | ✅ | ✅ | TBO API password |
| `TBO_ENDPOINT` | ✅ | ❌ | ❌ | TBO SOAP endpoint |
| `TBO_FORCE_MOCK` | ❌ | ✅ (`true`) | ❌ | Force mock data flag |
| `VERCEL_OIDC_TOKEN` | Root `.env.local` only | ❌ | ❌ | Vercel auth (auto) |

**Where each file lives:**
- `gorasa-next/.env.local` — the app's env vars (gitignored)
- `/home/nikhil/Downloads/Gorasa/App-1/rasa-zero-app-main/.env.local` — root .env.local (Vercel auto-generated, ONLY has VERCEL_OIDC_TOKEN)
- Vercel dashboard — production env vars (set via `npx vercel env add` or Web UI)

---

## 5. Agent Session Checklist

Every time an agent starts working on this project:

### Step 1: Know the working directory
```bash
# All commands run from gorasa-next/
cd /home/nikhil/Downloads/Gorasa/App-1/rasa-zero-app-main/gorasa-next
```

### Step 2: Know what's deployed where
- **Primary app:** Next.js → `gorasa-next/` → Vercel (`gorasa-next` project)
- **Legacy frontend:** Vite → `packages/frontend/` → Netlify (no longer active?)
- **Legacy backend:** Express → `packages/backend/` → Render (via .mcp.json)
- **Database:** Supabase → `isubgeemvhvhnhikxbjb`

### Step 3: Know the remotes
- `git push neworigin main` deploys to production
- `origin` is a secondary remote (nikjp2021's fork)

### Step 4: Don't touch the root `.vercel/`
- Root `.vercel/` contains ONLY a README — the old Vite app's Vercel config
- The real Vercel config is in `gorasa-next/.vercel/`

### Step 5: Vercel deployment failures
- If Vercel build fails with "No Next.js version detected" → Root Directory is wrong
- Fix: ensure root `vercel.json` has `{"rootDirectory": "gorasa-next"}`

### Step 6: TBO mock vs live
- `TBO_FORCE_MOCK=true` on Vercel → always uses mock data
- Without it, TBO real API is attempted (currently failing with "Technical Failure")
- Mock data has 6 hotels for Goa

### Step 7: Build before pushing
```bash
cd /home/nikhil/Downloads/Gorasa/App-1/rasa-zero-app-main/gorasa-next
npx next build
# Fix any errors, then:
git push neworigin main
```

---

> The remaining sections below (6–19) are reproduced from the full project reference for completeness. For the most up-to-date version of these sections, run the explore agent to regenerate.

---

## 6. Project Overview

GoRASA is a **luxury travel platform** for Indian travelers. It supports:
- Flight search & booking
- Luxury hotel search (via TBO API or mock data)
- Holiday package browsing & booking
- Lead management (sales pipeline)
- Loyalty rewards program
- Corporate/B2B travel (wallet, discount rates)
- Admin dashboard with KPIs
- WhatsApp-style concierge chat
- Google OAuth + email/password auth (Supabase Auth)

### Three Deployments / Apps

| App | Directory | Tech Stack | Deployment |
|-----|-----------|------------|------------|
| **Next.js App** | `gorasa-next/` | Next.js 16.2, React 19, Tailwind CSS 4, Supabase | Vercel |
| **Old Frontend** | `packages/frontend/` | React 19, Vite 6, Tailwind CSS | Netlify |
| **Old Backend** | `packages/backend/` | Express 4, Prisma 6, Supabase Auth | Render |

The **gorasa-next** app is the primary application. The `packages/` directory contains an older Vite+Express version.

---

## 7. Project Structure

Key directories:

```
rasa-zero-app-main/
├── .mcp.json                    # Render MCP token (gitignored)
├── .opencode/                   # Opencode framework directives
├── api/                         # Legacy Vercel serverless functions
├── gorasa-next/                 # ★ PRIMARY APPLICATION
│   ├── .env.local              # Supabase + TBO credentials
│   ├── .vercel/project.json    # Vercel project linkage
│   ├── prisma/schema.prisma    # Database schema
│   ├── src/
│   │   ├── app/                # Next.js App Router (pages + API routes)
│   │   ├── components/         # React components
│   │   ├── hooks/              # Auth context & hooks
│   │   └── lib/                # Utilities, TBO client, Supabase clients
│   └── public/                 # Static assets
├── packages/                    # Legacy monorepo (backend + frontend)
├── dist/                        # Legacy build output
├── node_modules/
├── package.json                 # Root workspace config
└── vercel.json                  # ★ NEEDS TO BE CREATED (rootDirectory fix)
```

---

## 8. Git Setup

### Remotes

```
origin    → https://github.com/nikjp2021/gorasa-app.git   (personal fork)
neworigin → https://github.com/nikgorasa/gorasav1.git      (production — deploy target)
```

### Branch

- `main` — single branch, all work happens here

### Git Config

```ini
[user]
  email = nikhil@cryptomite.win
  name = nikjp2021
```

### .gitignore (root)

```
node_modules
dist
*.db
.vite
.vscode
.mcp.json       ← Render token NOT committed
.vercel         ← Vercel linkage NOT committed
.env*           ← All .env files NOT committed
```

---

## 9. Supabase Configuration

### Project Details

- **Project URL:** `https://isubgeemvhvhnhikxbjb.supabase.co`
- **Project Ref:** `isubgeemvhvhnhikxbjb`
- **Region:** `ap-southeast-1` (Singapore)
- **Auth:** Email/password + Google OAuth

### Connection Strings

| Parameter | Value |
|-----------|-------|
| Pooled URL | `postgresql://postgres.isubgeemvhvhnhikxbjb:Womanly%40Deem6%40Trivial@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres` |
| Direct URL | `postgresql://postgres:Womanly%40Deem6%40Trivial@db.isubgeemvhvhnhikxbjb.supabase.co:5432/postgres` |

### API Keys

| Key | Where | Usage |
|-----|-------|-------|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` + Vercel | Browser/client-side (anon role) |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` + Vercel | Server-side admin operations |

### Connecting via MCP

The Supabase MCP is configured globally (not in repo):
```
~/.config/opencode/opencode.jsonc → mcp.supabase.url
```
Uses remote connection with project ref `isubgeemvhvhnhikxbjb`. No token needed in the MCP config — the MCP server handles auth.

---

## 10. Database Schema

**Prisma Schema:** `gorasa-next/prisma/schema.prisma` (10 tables: User, Company, Lead, Activity, Package, Booking, Payment, Invoice, CancellationRequest, PricingRule)

**Supabase-only tables** (27+ tables, queried via raw Supabase client):
Testimonial, PackageCategory, ValueProposition, City, Flight, Faq, FaqCategory, FooterLink, NavigationItem, Role, SiteConfig, PromoCode, LoyaltyReward, Redemption, LeadStage, PreferenceOption, QuickTopUpAmount

**Naming convention:**
- Prisma tables → camelCase columns
- Raw Supabase tables → lowercase snake_case columns
- API routes map between them

---

## 11. Build Configuration

### gorasa-next/package.json

- **Next.js:** 16.2.7
- **React:** 19.2.4
- **Tailwind:** v4 (CSS-based config, `@import "tailwindcss"`)
- **Supabase:** `@supabase/ssr` + `@supabase/supabase-js`
- **Motion:** `motion` (Framer Motion successor)
- **Icons:** `lucide-react`
- **Database:** Prisma 6

### Scripts

```bash
cd gorasa-next
npm run dev     # next dev (default port 3000)
npm run build   # next build
npx next build  # also works
```

### Tailwind Config

Custom colors: `brand-saffron (#F97316)`, `brand-burnt (#C2410C)`, `brand-dark (#1E293B)`, `brand-cream (#FFF7ED)`, `brand-gold (#F59E0B)`

Fonts: Inter (sans), Playfair Display (serif), Outfit (display)

---

## 12. API Routes — gorasa-next

All routes under `gorasa-next/src/app/api/` (27+ endpoints):

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/auth/login` | POST | None | Find/create user by email |
| `/api/auth/me` | GET | Supabase session | Current user |
| `/api/bookings` | GET/POST | `x-user-email` header | User bookings CRUD |
| `/api/cancellations` | POST | None | Request cancellation |
| `/api/dashboard` | GET | None | Dashboard KPIs |
| `/api/packages` | GET/POST | None | Package CRUD |
| `/api/packages/[id]` | GET/PUT/DELETE | None | Single package |
| `/api/packages/carousel` | GET | None | Grouped by category |
| `/api/leads` | GET/POST | None | Lead management |
| `/api/leads/[id]` | GET/PUT/DELETE | None | Single lead |
| `/api/leads/stages` | GET | None | Pipeline stages |
| `/api/users` | GET/PATCH | None | User management |
| `/api/users/demo` | GET | None | Demo users for login |
| `/api/flights` | GET | None | Flight search (mock) |
| `/api/cities` | GET | None | Cities (domestic/international) |
| `/api/categories` | GET | None | Package categories |
| `/api/tbo` | POST | None | TBO hotel search proxy |
| `/api/companies` | GET | None | Active companies |
| `/api/companies/[id]` | PATCH | None | Wallet update |
| `/api/profile` | GET/PATCH | `x-user-email` header | User profile |
| `/api/faq` | GET | None | FAQ entries |
| `/api/faq/categories` | GET | None | FAQ categories |
| `/api/footer-links` | GET | None | Footer links |
| `/api/navigation` | GET | None | Navigation items |
| `/api/preferences/options` | GET | None | Preference options |
| `/api/promos` | GET/POST | None | Promo codes |
| `/api/rewards` | GET | None | Loyalty rewards |
| `/api/roles` | GET | None | Roles list |
| `/api/site-config` | GET | None | Site config KV |
| `/api/testimonials` | GET | None | Testimonials |
| `/api/topup-amounts` | GET | None | Wallet top-up presets |
| `/api/value-propositions` | GET | None | Homepage VPs |
| `/api/loyalty/history` | GET | None | Loyalty history |

---

## 13. TBO Integration

### Overview

TBO Holidays (`api.tbotechnology.in`) — hotel booking API via SOAP/XML. Integrates with full mock fallback.

### Architecture

```
/api/tbo (POST)
  → tbo-hotel-client.ts (orchestrator)
    → tbo-hotel-api.ts (SOAP XML builder)
    → tbo-hotel-mock.ts (mock data — 5 cities)
  → tbo-hotel-types.ts (TypeScript interfaces)
```

### Client Logic

```javascript
const hasCredentials = !!(TBO_USERNAME && TBO_PASSWORD) && TBO_FORCE_MOCK !== "true";
```

- `TBO_FORCE_MOCK=true` → forces mock data regardless of credentials
- Credentials exist but API fails → falls back to mock
- No credentials → mock data

### Current Status

- **Credentials:** `RasaTAPI` / `RasaT@123` — set in `.env.local` and Vercel
- **Real API:** Returns error code `04-6517` ("Technical Failure") — TBO needs to activate the account
- **Mock data:** Working. 6 hotels in Goa, 3+ in other cities
- **Vercel production:** `TBO_FORCE_MOCK=true` → mock data always

### Booking Pipeline (in UI)

1. Search hotels → select hotel → view rooms
2. Click "Book Now" → login check → `HotelBookingModal`
3. Fill guest details → "Confirm Booking"
4. Block (price verify) → Book (TBO confirm) → Save (Supabase `/api/bookings`)
5. Confirmation shown

---

## 14. Authentication System

### Dual Auth

1. **Supabase Auth** — email/password + Google OAuth (primary)
2. **Demo mode** — fallback for prototype users (finds/creates user by email via `POST /api/auth/login`)

### User Roles

| Role | Access |
|------|--------|
| `SUPER_ADMIN` | Full access, all CRUD |
| `ADMIN` | Admin panel access |
| `SALES` | Lead management |
| `CORPORATE_USER` | B2B travel with wallet |
| `CUSTOMER` | Browse, book, trips |

### Auth in API Routes

- Most routes use **no auth** (public)
- Some use **`x-user-email` header** (profile, bookings)
- `/api/auth/me` uses **Supabase SSR cookies**

---

## 15. App Pages

| Route | Type | Description |
|-------|------|-------------|
| `/` | SSR (ISR 300s) | Homepage — packages, testimonials, VPs |
| `/login` | Client | Login page |
| `/auth/callback` | Server | OAuth callback |
| `/flights` | Client | Flight search |
| `/hotels` | Client | Hotel search (TBO) |
| `/holidays` | Client | Holiday packages |
| `/trips` | Client | My bookings |
| `/profile` | Client | User profile |
| `/support` | Client | Support page |
| `/admin/*` | Client | Admin panel (6 sub-pages) |

---

## 16. Admin Panel

- Route: `/admin/*`
- Layout: `admin/layout.tsx` — role check (ADMIN/SUPER_ADMIN), sidebar from DB
- Pages: dashboard, leads, b2b, packages, promos, users, loyalty

---

## 17. Legacy Code (packages/)

Not the primary app. Old Vite+Express monorepo. Still referenced but should not be the focus of new work.

- `packages/frontend/` — React 19, Vite 6 (deployed to Netlify via `dist/`)
- `packages/backend/` — Express 4, Prisma 6 (deployed to Render via `packages/backend/.env`)

---

## 18. Seed Data & Demo Users

### Demo Login Credentials

| Email | Role | Password |
|-------|------|----------|
| `hmittal@gorasa.in` | SUPER_ADMIN | `demo123` |
| `admin@gorasa.in` | ADMIN | `demo123` |
| `sales@gorasa.in` | SALES | `demo123` |
| `neha@corp.in` | CORPORATE_USER | `demo123` |
| `amit@example.com` | CUSTOMER | `demo123` |
| `priya@example.com` | CUSTOMER | `demo123` |

---

## 19. Key Architectural Notes

1. **Next.js v16** — not your training data's Next.js. Check `node_modules/next/dist/docs/` for breaking changes.
2. **Tailwind v4** — uses `@import "tailwindcss"` and `@theme` directive (CSS-based config, not JS).
3. **Motion** library — Framer Motion successor. Import from `motion/react`.
4. **Dual DB access** — Prisma (10 tables) + raw Supabase queries (27+ tables). Mixed.
5. **Inconsistent auth** — most API routes have no auth. Security concern for production.
6. **No CI/CD** — no GitHub Actions, no Docker.
7. **App Router** — Next.js App Router with `src/` directory.
8. **AGENTS.md** — exists in `gorasa-next/AGENTS.md`, currently just warns about Next.js version differences.

---

*End of GoRASA Configuration Reference. Generated 2026-06-09. Update this file when configuration changes.*
