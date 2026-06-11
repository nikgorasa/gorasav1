# GoRASA — Configuration Reference

> **Generated:** 2026-06-11  
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
| **Vercel Dev Project ID** | `prj_BWE4hfy72DwYF39XamAwGYi3qg63` | Vercel API |
| **Vercel QA Project ID** | `prj_j2eXtGEfgMZqUeTxlMjE0TCyyBwN` | Vercel API |
| **Vercel Team ID** | `team_0pR3Xnbjx12q8H8pZF9xgE5S` | `.vercel/project.json` |
| **Vercel Root Directory** | **`gorasa-next/`** | Set via API (not vercel.json) |
| **Vercel Env: TBO_FORCE_MOCK** | Removed (was `true`) | Vercel dashboard — removed Jun 11, 2026 |
| **Deploy target (Production)** | `git push neworigin main` → Vercel auto-deploy | Vercel Git integration |
| **Deploy target (Dev)** | `git push neworigin dev` → GitHub Actions → Vercel | `.github/workflows/deploy-dev.yml` |
| **Deploy target (QA)** | `git push neworigin qa` → GitHub Actions → Vercel | `.github/workflows/deploy-qa.yml` |
| **Git remote (deploy)** | `neworigin → https://github.com/nikgorasa/gorasav1.git` | `git remote -v` |
| **Git remote (origin)** | `origin → https://github.com/nikjp2021/gorasa-app.git` | `git remote -v` |
| **App working directory** | `gorasa-next/` (NOT repo root) | All `npm`/`next` commands |
| **Node version** | 24.x (Vercel), 24.15.0 (local) | No `.nvmrc` |
| **Render MCP token** | In `.mcp.json` (gitignored) | Repo root `.mcp.json` |
| **Env vars file** | `gorasa-next/.env.local` (gitignored) | Contains Supabase + TBO creds |
| **NEON Dev DB** | `gorasa-dev` on `ep-quiet-tooth-aiehj2mq.c-4.us-east-1.aws.neon.tech` | GitHub env secrets |
| **NEON QA DB** | `gorasa-qa` on `ep-quiet-tooth-aiehj2mq.c-4.us-east-1.aws.neon.tech` | GitHub env secrets |

---

## Table of Contents

1. [Quick Reference](#quick-reference-critical-values)
2. [MCP & Agent Tools Configuration](#2-mcp--agent-tools-configuration)
3. [Vercel Deployment Pipeline](#3-vercel-deployment-pipeline)
4. [TBO Flight API](#tbo-flight-api)
5. [TBO Hotel REST API](#tbo-hotel-rest-api)
6. [Environment Variables Source Map](#6-environment-variables-source-map)
7. [🔑 Keys & Tokens Inventory](#-keys--tokens-inventory)
8. [Agent Session Checklist](#8-agent-session-checklist)
9. [Project Overview](#9-project-overview)
10. [Project Structure](#10-project-structure)
11. [Git Setup](#11-git-setup)
12. [Supabase Configuration](#12-supabase-configuration)
13. [Database Schema](#13-database-schema)
14. [Build Configuration](#14-build-configuration)
15. [API Routes — gorasa-next](#15-api-routes--gorasa-next)
16. [TBO Integration](#16-tbo-integration)
17. [Authentication System](#17-authentication-system)
18. [App Pages](#18-app-pages)
19. [Admin Panel](#19-admin-panel)
20. [Legacy Code (packages/)](#20-legacy-code-packages)
21. [Seed Data & Demo Users](#21-seed-data--demo-users)
22. [Key Architectural Notes](#22-key-architectural-notes)
23. [Staging Environments (Dev/QA)](#23-staging-environments-devqa)

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

### ❗ Critical: Root Directory Setting

The `gorasa-next` Vercel project MUST have **Root Directory** set to `gorasa-next/`. Without this, Vercel builds from the repo root (a monorepo without Next.js) and fails with `Error: No Next.js version detected.`

**NOTE:** `rootDirectory` is a **dashboard/API setting** — it is NOT a valid property in `vercel.json`. Never put it in a `vercel.json` file (Vercel will reject the build with schema validation error).

**How to fix if reset:**
```bash
cd gorasa-next
npx vercel project inspect   # Check current rootDirectory
```
If it's `.`, update via API (using Vercel access token):
```bash
curl -X PATCH "https://api.vercel.com/v1/projects/prj_WLoI80KaCmVZSudP17ohcPbzTpSe?teamId=team_0pR3Xnbjx12q8H8pZF9xgE5S" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rootDirectory":"gorasa-next"}'
```

Or set in Vercel Dashboard → gorasa-next → Settings → General → Root Directory.

### Status (as of 2026-06-09)

- **Root Directory:** Set to `gorasa-next` ✅ (via API)
- **Rasa-zero-app-main project:** Git disconnected ✅ (no longer triggers duplicate builds)
- **Production API:** Returning 6 mock hotels ✅
- **Build command:** `npx prisma generate && npx next build` (in `gorasa-next/vercel.json`)

### How to Deploy

**Auto-deploy (via Git push — preferred):**
```bash
cd /home/nikhil/Downloads/Gorasa/App-1/rasa-zero-app-main
git add <files>
git commit -m "message"
git push neworigin main
```

**Direct deploy (via Vercel CLI):**
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

## TBO Flight API

### Endpoints
| Service | URL |
|---------|-----|
| Authentication | `http://Sharedapi.tektravels.com/SharedData.svc/rest/Authenticate` |
| Search | `http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Search` |
| FareRule | `http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/FareRule` |
| FareQuote | `http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/FareQuote` |
| SSR | `http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/SSR` |
| Book (Non-LCC) | `http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Book` |
| Ticket | `http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Ticket` |
| GetBookingDetails | `http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/GetBookingDetails` |

### Flow
- **LCC**: Authenticate → Search → FareRule → FareQuote → SSR(optional) → Ticket → GetBookingDetail
- **Non-LCC (GDS)**: Authenticate → Search → FareRule → FareQuote → SSR(optional) → Book → Ticket → GetBookingDetail
- **LCC Return**: Search once → split into OB/IB → run Ticket per leg → 2 PNRs

### Token Management
- **TokenId**: One per day (00:00–23:59 UTC), shared across all API calls
- **TraceId**: Valid 15 minutes, returned by Search, passed to subsequent calls
- Client caches TokenId at module level, auto-renews on date change

### Cert Cases (8)
Generated by `scripts/generate-tbo-flight-cases.ts` into `scripts/tbo-flight-cases/`:
1. GDS Domestic Oneway (DEL→BOM, 1A) — mandatory
2. LCC Domestic Oneway SSR (DEL→BOM, 1A+1C+1I) — mandatory
3. LCC Domestic Return (DEL↔BOM, 2A+2C+1I) — mandatory
4. LCC International Oneway SSR (DEL→DXB, 1A+1C+1I) — mandatory
5. GDS International Return (DEL↔DXB, 2A+2C+1I) — mandatory
6. LCC Domestic Special Return (DEL↔BOM, 2A+1C)
7. GDS Domestic Special Return SSR (DEL↔BLR, 2A+2C+1I)
8. GDS Multi-city (DEL→BOM→BLR, 2A)

### Code Files
| File | Purpose |
|------|---------|
| `gorasa-next/src/lib/tbo-flight-types.ts` | All API request/response/display type definitions |
| `gorasa-next/src/lib/tbo-flight-api.ts` | Raw HTTP fetch client (7 exported functions) |
| `gorasa-next/src/lib/tbo-flight-mock.ts` | Mock data for all 4 sectors with realistic pricing |
| `gorasa-next/src/lib/tbo-flight-client.ts` | Orchestrator: token caching, LCC/Non-LCC branching, try→catch→mock fallback |
| `gorasa-next/src/app/api/tbo-flights/route.ts` | Next.js API route with 7 POST actions |

### Env Vars
| Variable | Default | Purpose |
|----------|---------|---------|
| `TBO_FLIGHT_FORCE_MOCK` | `"true"` | Bypasses real API, uses mock data |

Reuses `TBO_USERNAME`, `TBO_PASSWORD`, `TBO_CLIENT_ID` from hotel credentials.

### Credential Status
**Credentials (from TBO support — Varsha Dhiman, Jun 5, 2026):**  
`RasaT` / `RasaT@123` / `ClientId: ApiIntegrationNew`  
Returns `Status: 3` on the shared Authenticate endpoint. Account needs TBO activation.  
All code defaults to mock via `TBO_FLIGHT_FORCE_MOCK=true`.

**Note:** The old username `RasaTAPI` was incorrect — official TBO credentials are `RasaT`. Updated in Vercel env on Jun 11, 2026.

---

## TBO Hotel REST API

> **⚠ CORRECTION (Jun 11, 2026):** The hotel REST API at `api.tbotechnology.in/TBOHolidays_HotelAPI/` uses **Basic Auth** (`Authorization: Basic base64(user:pass)`), NOT TokenId. The `affiliate.tektravels.com` endpoints listed in the old docs returned `Status: 500` or `Method not found`. The tbotechnology domain is the correct one for TBO Holidays hotel API.

### Endpoints
| Service | URL | Auth | Method |
|---------|-----|------|--------|
| Search | `http://api.tbotechnology.in/TBOHolidays_HotelAPI/Search` | Basic Auth | POST |
| PreBook | `http://api.tbotechnology.in/TBOHolidays_HotelAPI/PreBook` | Basic Auth | POST |
| Book | `http://api.tbotechnology.in/TBOHolidays_HotelAPI/Book` | Basic Auth | POST |
| Static Data — CountryList | `http://api.tbotechnology.in/TBOHolidays_HotelAPI/CountryList` | Basic Auth | GET |
| Static Data — CityList | `http://api.tbotechnology.in/TBOHolidays_HotelAPI/CityList` | Basic Auth | POST (body: `{CountryCode}`) |
| Static Data — HotelCodeList | `http://api.tbotechnology.in/TBOHolidays_HotelAPI/TBOHotelCodeList` | Basic Auth | POST (body: `{CityCode}`) |
| Static Data — HotelDetails | `http://api.tbotechnology.in/TBOHolidays_HotelAPI/HotelDetails` | Basic Auth | POST (body: `{HotelCode}`) |

### Flow
1. **Authenticate** — Basic Auth on every request (`Authorization: Basic base64(user:pass)`), plus `UserName`+`Password` in request body
2. **Resolve City → Hotel Codes** (first search for a city):
   - CityList(CountryCode=IN) → get city code (e.g., Goa = 15648)
   - TBOHotelCodeList(CityCode) → get `HotelCode[]` for that city (up to 50 codes)
   - Cached per city at module level (`_hotelCodesCache`)
3. **Search** — `HotelCodes` (comma-separated), `CheckIn`, `CheckOut`, `PaxRooms[]`, `GuestNationality`
4. **PreBook** — `BookingCode` from Search response room; returns pax detail requirements
5. **Book** — `BookingCode`, `HotelRoomsDetails[]` with `HotelPassenger[]`

> **⚠ IMPORTANT:** Search requires `HotelCodes` — city-based search alone returns `Status: 400: "Hotel Codes can not be null or empty"`. Always resolve hotel codes first via TBOHotelCodeList.

### Key Differences from Flight API
| Flight API | Hotel API |
|------------|-----------|
| TokenId auth (authenticate endpoint) | Basic Auth on every request |
| `api.tektravels.com` | `api.tbotechnology.in` |
| Credentials: `RasaT`/`RasaT@123` | Credentials: `TBOStaticAPITest`/`Tbo@11530818` |
| Search by city code | Search by city name |
| RateDiff/RateChange in response | Direct result objects |

### Caching
- **Basic Auth** — No token to expire; credentials sent on every request
- **Search results** — Cached at module level (not per-request)
- **Static data** — City/hotel lists cached at module level on first fetch

### Credential Status (Jun 11, 2026)
| Credential Set | Works For | Status |
|----------------|-----------|--------|
| `RasaT`/`RasaT@123` | Flight API (`api.tektravels.com`) | ✅ Authenticate returns TokenId |
| `TBOStaticAPITest`/`Tbo@11530818` | Hotel API (`api.tbotechnology.in`) | ✅ Search returns rooms, PreBook reachable (test balance) |

**Test credentials for hotel have no balance** — PreBook returns "Insufficient Balance" which is expected for the `TBOStaticAPITest` account. Production credentials from TBO should resolve this.

### Code Files
| File | Purpose |
|------|---------|
| `gorasa-next/src/lib/tbo-hotel-types.ts` | All REST request/response/display type definitions |
| `gorasa-next/src/lib/tbo-hotel-api.ts` | Raw HTTP fetch client with Basic Auth |
| `gorasa-next/src/lib/tbo-hotel-mock.ts` | Mock data for 9 cities with realistic pricing |
| `gorasa-next/src/lib/tbo-hotel-client.ts` | Orchestrator: auth, search, try→catch→mock fallback |
| `gorasa-next/src/app/api/tbo-hotels/route.ts` | Next.js API route with dedicated GET/POST handlers |

### Env Vars
| Variable | Default | Purpose |
|----------|---------|---------|
| `TBO_HOTEL_USERNAME` | — | Hotel API login (`TBOStaticAPITest` for test) |
| `TBO_HOTEL_PASSWORD` | — | Hotel API password (`Tbo@11530818` for test) |
| `TBO_HOTEL_FORCE_MOCK` | `"false"` | Set to `"true"` to force mock data |
| `TBO_USERNAME` | — | Flight API login (`RasaT`) |
| `TBO_PASSWORD` | — | Flight API password (`RasaT@123`) |

> **Important:** Hotel and Flight APIs use **different** credentials. `TBO_HOTEL_USERNAME`/`TBO_HOTEL_PASSWORD` for hotel, `TBO_USERNAME`/`TBO_PASSWORD` for flight. Never assume they share auth.

---

## 6. Environment Variables Source Map

| Variable | `.env.local` | Vercel Prod | Vercel Dev | Purpose |
|----------|:---:|:---:|:---:|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ | ✅ | Client-side Supabase key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | ✅ | ✅ | Admin DB access |
| `DATABASE_URL` | ✅ | ✅ | ✅ | Prisma pooled connection |
| `DIRECT_URL` | ✅ | ✅ | ✅ | Prisma direct connection |
| `TBO_USERNAME` | ✅ | ✅ | ✅ | TBO flight API login (`RasaT`) |
| `TBO_PASSWORD` | ✅ | ✅ | ✅ | TBO flight API password (`RasaT@123`) |
| `TBO_HOTEL_USERNAME` | ✅ | ✅ | ❌ | TBO hotel API login (`TBOStaticAPITest`) |
| `TBO_HOTEL_PASSWORD` | ✅ | ✅ | ❌ | TBO hotel API password (`Tbo@11530818`) |
| `TBO_FORCE_MOCK` | ❌ | ❌ (removed) | ❌ | Was forcing mock data — removed Jun 11, 2026 |
| `VERCEL_OIDC_TOKEN` | Root `.env.local` only | ❌ | ❌ | Vercel auth (auto) |

**Where each file lives:**
- `gorasa-next/.env.local` — the app's env vars (gitignored)
- `/home/nikhil/Downloads/Gorasa/App-1/rasa-zero-app-main/.env.local` — root .env.local (Vercel auto-generated, ONLY has VERCEL_OIDC_TOKEN)
- Vercel dashboard — production env vars (set via `npx vercel env add` or Web UI)

> **Note:** `TBO_FORCE_MOCK` was removed from Vercel Production on Jun 11, 2026 to enable live API. Hotel and flight APIs now use real credentials.

---

## 🔑 Keys & Tokens Inventory

> **Critical:** Every key/token in this project is listed below with its status, where it's used, and how to verify it's valid. If a key changes (e.g., Supabase JWT rotation), update this table immediately.

### Supabase Keys

| Key | Role | Used In (files) | `.env.local` | Vercel Prod | Last Verified | Verification Command |
|-----|------|-----------------|:---:|:---:|:---:|---------------------|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` (public) | `lib/supabase.ts`, browser client | ✅ | ✅ | 2026-06-11 | `createClient(url, key).from('User').select('count').limit(1)` → returns `[]` (empty, RLS blocks) but NO error |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` (admin) | `lib/supabase-admin.ts`, `api/auth/login/route.ts`, `api/auth/me/route.ts`, `api/users/demo/route.ts` | ✅ | ✅ | 2026-06-11 | `createClient(url, key).from('User').select('*').limit(1)` → returns user data |

**⚠️ Known Issue — Stale JWT Signatures:**
- Both keys share the same JWT header/payload format. The `SUPABASE_SERVICE_ROLE_KEY` can become invalid if the project's JWT secret is rotated.
- **Symptoms:** API routes return `{"error":"..."}` with Vercel log `message: 'Invalid API key'`
- **Fix:** Get a fresh key from Supabase Dashboard → Project Settings → API → `service_role` key. Update both `.env.local` AND Vercel env var.
- **Prevention:** Run the verification command above after any Supabase project setting changes.

### How Each Key Is Used in Code

| Key | Supabase Client Created | Auth Mechanism | Impact if Invalid |
|-----|------------------------|----------------|-------------------|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `createClient(url, anonKey)` in `lib/supabase.ts` | RLS policies on each table | Anon users see no data, RLS 42501 errors |
| `SUPABASE_SERVICE_ROLE_KEY` | `createClient(url, serviceKey)` in `lib/supabase-admin.ts` | Bypasses all RLS (service role) | All server-side API routes fail with "Invalid API key" |

### TBO Credentials

| Credential | Used In | `.env.local` | Vercel Prod | Status | Notes |
|------------|---------|:---:|:---:|:---:|-------|
| `TBO_USERNAME` | `lib/tbo-flight-api.ts` | ✅ (`RasaT`) | ✅ (`RasaT`) | ✅ Live | Flight API login |
| `TBO_PASSWORD` | `lib/tbo-flight-api.ts` | ✅ (`RasaT@123`) | ✅ | ✅ Live | Flight API password |
| `TBO_CLIENT_ID` | `lib/tbo-flight-client.ts` | ✅ (`ApiIntegrationNew`) | ✅ | ✅ Config value | Static: `"ApiIntegrationNew"` |
| `TBO_HOTEL_USERNAME` | `lib/tbo-hotel-api.ts` | ✅ (`TBOStaticAPITest`) | ✅ | ✅ Live | Hotel Basic Auth login |
| `TBO_HOTEL_PASSWORD` | `lib/tbo-hotel-api.ts` | ✅ (`Tbo@11530818`) | ✅ | ✅ Live | Hotel Basic Auth password |
| `TBO_FORCE_MOCK` | `lib/tbo-flight-client.ts`, `lib/tbo-hotel-client.ts` | ❌ | ❌ (removed) | ❌ Disabled | Removed Jun 11, 2026 to enable live API |
| `TBO_FLIGHT_FORCE_MOCK` | `lib/tbo-flight-client.ts` | ❌ | ❌ | N/A | Falls back to `TBO_FORCE_MOCK` |
| `TBO_HOTEL_FORCE_MOCK` | `lib/tbo-hotel-client.ts` | ❌ | ❌ | N/A | Falls back to `TBO_FORCE_MOCK` |

### Database Connection Strings

| Variable | Used By | `.env.local` | Vercel Prod | Purpose |
|----------|---------|:---:|:---:|---------|
| `DATABASE_URL` | Prisma (pooled) | ✅ | ✅ | `prisma migrate`, `prisma generate`, runtime queries |
| `DIRECT_URL` | Prisma (direct) | ✅ | ✅ | `prisma db push`, migrations (bypasses pgBouncer) |

### Miscellaneous

| Token | Where | Used For | Status |
|-------|-------|----------|--------|
| Render MCP token | `.mcp.json` (repo root, gitignored) | Legacy backend deploys via Render MCP | ✅ Static |
| Vercel OIDC token | Root `.env.local` | Vercel auth (auto-generated) | ✅ Auto-managed |
| `opencode-yaml-hooks` plugin | `~/.config/opencode/opencode.jsonc` | Governance hooks (TSC, post-task) | ✅ Installed |

### Key Verification Script

Run this anytime Supabase keys are suspected to be stale:

```bash
cd /home/nikhil/Downloads/Gorasa/App-1/rasa-zero-app-main/gorasa-next
node -e "
const { createClient } = require('@supabase/supabase-js');
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function test() {
  // Test anon key (should return empty array due to RLS, NOT error)
  const a = createClient(URL, ANON);
  const { data: ad, error: ae } = await a.from('User').select('count').limit(1);
  console.log('ANON:', ae ? 'INVALID' : 'OK', ae?.message || '');

  // Test service key (should return user data)
  const s = createClient(URL, SERVICE);
  const { data: sd, error: se } = await s.from('User').select('*').limit(1);
  console.log('SERVICE:', se ? 'INVALID' : 'OK', se?.message || '');
}
test();
"
```

Expected output:
```
ANON: OK
SERVICE: OK
```

If you see `Invalid API key`, get fresh keys from Supabase Dashboard → Project Settings → API.

---

## 8. Agent Session Checklist

Every time an agent starts working on this project:

### Step 1: Read project docs
```bash
cat ../Sprint-1.md ../LEARNING-FROM-MISTAKES.md ../CONFIG-REFERENCE.md ../DEPLOYMENT_LOG.md ../MEMORY.md
```

### Step 2: Know the working directory
```bash
# All commands run from gorasa-next/
cd /home/nikhil/Downloads/Gorasa/App-1/rasa-zero-app-main/gorasa-next
```

### Step 3: Know what's deployed where
- **Primary app:** Next.js → `gorasa-next/` → Vercel (`gorasa-next` project)
- **Legacy frontend:** Vite → `packages/frontend/` → Netlify (no longer active?)
- **Legacy backend:** Express → `packages/backend/` → Render (via .mcp.json)
- **Database:** Supabase → `isubgeemvhvhnhikxbjb`

### Step 4: Know the remotes
- `git push neworigin main` deploys to production
- `origin` is a secondary remote (nikjp2021's fork)

### Step 5: Verify keys work before debugging remotely
```bash
node -e "
const { createClient } = require('@supabase/supabase-js');
[['ANON',process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY],['SERVICE',process.env.SUPABASE_SERVICE_ROLE_KEY]]
.forEach(([n,k]) => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, k)
.from('User').select('count').limit(1).then(({error}) => console.log(n, error ? 'INVALID:'+error.message : 'OK')));
"
```

### Step 6: Don't touch the root `.vercel/`
- Root `.vercel/` contains ONLY a README — the old Vite app's Vercel config
- The real Vercel config is in `gorasa-next/.vercel/`

### Step 7: Vercel deployment failures
- If Vercel build fails with "No Next.js version detected" → Root Directory is `.` instead of `gorasa-next/`
- Fix: update via API — `curl -X PATCH "https://api.vercel.com/v1/projects/prj_WLoI80KaCmVZSudP17ohcPbzTpSe?teamId=team_0pR3Xnbjx12q8H8pZF9xgE5S" -H "Authorization: Bearer $VERCEL_TOKEN" -d '{"rootDirectory":"gorasa-next"}'`
- Or set in Vercel Dashboard → gorasa-next → Settings → General → Root Directory
- **Do NOT put `rootDirectory` in vercel.json** — it's not a valid property and will fail schema validation

### Step 8: TBO mock vs live
- `TBO_FORCE_MOCK=true` on Vercel → always uses mock data
- Without it, TBO real API is attempted (currently failing with "Technical Failure")
- Mock data has 6 hotels for Goa

### Step 9: Build before pushing
```bash
cd /home/nikhil/Downloads/Gorasa/App-1/rasa-zero-app-main/gorasa-next
npx next build
# Fix any errors, then:
git push neworigin main
```

---

> The remaining sections below are reproduced from the full project reference for completeness. For the most up-to-date version, run the explore agent to regenerate.

---

## 9. Project Overview

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

## 10. Project Structure

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

## 11. Git Setup

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

## 12. Supabase Configuration

### Project Details

- **Project URL:** `https://isubgeemvhvhnhikxbjb.supabase.co`
- **Project Ref:** `isubgeemvhvhnhikxbjb`
- **Region:** `ap-southeast-1` (Singapore)
- **Auth:** Email/password + Google OAuth

### Connection Strings

| Parameter | Value |
|-----------|-------|
| Pooled URL | `postgresql://postgres.isubgeemvhvhnhikxbjb:REDACTED_SUPABASE_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres` |
| Direct URL | `postgresql://postgres:REDACTED_SUPABASE_PASSWORD@db.isubgeemvhvhnhikxbjb.supabase.co:5432/postgres` |

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

## 13. Database Schema

**Prisma Schema:** `gorasa-next/prisma/schema.prisma` (10 tables: User, Company, Lead, Activity, Package, Booking, Payment, Invoice, CancellationRequest, PricingRule)

**Supabase-only tables** (30+ tables, queried via raw Supabase client):
Testimonial, PackageCategory, ValueProposition, City, Flight, Faq, FaqCategory, FooterLink, NavigationItem, Role, SiteConfig, PromoCode, LoyaltyReward, Redemption, LeadStage, PreferenceOption, QuickTopUpAmount, tickets, ticket_notes, ticket_activities

**Naming convention:**
- Prisma tables → camelCase columns
- Raw Supabase tables → lowercase snake_case columns
- API routes map between them

**RLS Status: ENABLED on all Supabase tables**
- All tables have Row Level Security enabled
- Permissive "Full access" policies for public role (matches Lead table pattern)
- Ticket tables (tickets, ticket_notes, ticket_activities): RLS enabled with "Full access" policy
- Lead table: RLS enabled with "Full access" policy (replaced service_role-only policy)
- API routes use anon key (RLS policies allow public access)

---

## 14. Build Configuration

### gorasa-next/package.json

- **Next.js:** 16.2.7
- **React:** 19.2.4
- **Tailwind:** v4 (CSS-based config, `@import "tailwindcss"`)
- **Supabase:** `@supabase/ssr` + `@supabase/supabase-js`
- **Motion:** `motion` (Framer Motion successor)
- **Icons:** `lucide-react`
- **Database:** Prisma 6
- **Search UI:** `cmdk` v1.1.1 (command palette for city dropdown)

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

## 15. API Routes — gorasa-next

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
| `/api/flights` | GET | None | Flight search (TBO live API) |
| `/api/cities` | GET | None | Cities from Supabase (domestic/international) |
| `/api/cities/tbo` | GET | None | **1,083 Indian cities from TBO live API** (Supabase fallback) |
| `/api/categories` | GET | None | Package categories |
| `/api/tbo` | POST | None | **TBO flight search** (search, fare-rule, fare-quote, book, ticket) |
| `/api/tbo-hotels` | POST | None | **TBO hotel search** (search, pre-book, book, booking-detail, static data) |
| `/api/support` | POST | None | Smart support (FAQ + intent routing) |
| `/api/tickets` | GET/POST | None | Ticket CRUD |
| `/api/tickets/[id]` | GET/PATCH | None | Single ticket |
| `/api/tickets/[id]/notes` | GET/POST | None | Ticket notes |
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

## 16. TBO Integration

### Overview

TBO (Travel Boutiques Online) — flight and hotel booking APIs. Both are now **LIVE** on production.

- **Flight API:** `api.tektravels.com` — TokenId auth, returns real flight results
- **Hotel API:** `api.tbotechnology.in` — Basic Auth, returns real hotel rooms with prices

### Architecture

```
/api/tbo (POST) — flight only
  → tbo-flight-client.ts (orchestrator)
    → tbo-flight-api.ts (TokenId auth, flight search)
    → tbo-flight-mock.ts (mock data)
  → tbo-flight-types.ts (TypeScript interfaces)

/api/tbo-hotels (POST) — hotel only
  → tbo-hotel-client.ts (orchestrator)
    → tbo-hotel-api.ts (Basic Auth, REST client)
    → tbo-hotel-mock.ts (mock data — 9 cities)
  → tbo-hotel-types.ts (TypeScript interfaces)

/api/cities/tbo (GET) — city search for dropdown
  → TBO CityList API (1,083 Indian cities)
  → Supabase City table fallback
  → 1-hour cache

CitySearchDropdown (component) — searchable dropdown with cmdk
  → Fetches from /api/cities/tbo
  → Client-side filtering as user types
  → Popular cities group + All Cities group
```

### Client Logic

```javascript
// Flight: TokenId auth
const hasFlightCreds = !!(TBO_USERNAME && TBO_PASSWORD) && TBO_FORCE_MOCK !== "true";

// Hotel: Basic Auth (separate credentials)
const hasHotelCreds = !!(TBO_HOTEL_USERNAME && TBO_HOTEL_PASSWORD) && TBO_HOTEL_FORCE_MOCK !== "true";
```

- `TBO_FORCE_MOCK=true` → forces mock data for flight
- `TBO_HOTEL_FORCE_MOCK=true` → forces mock data for hotel
- Credentials exist but API fails → falls back to mock
- No credentials → mock data

### Current Status (Jun 11, 2026)

| API | Status | Notes |
|-----|--------|-------|
| Flight search | ✅ LIVE | Returns real flights (IndiGo, SpiceJet, Air India) |
| Hotel search | ✅ LIVE | Returns real rooms with prices (USD/INR) |
| City dropdown | ✅ LIVE | 1,083 Indian cities from TBO CityList API |
| Hotel PreBook | ⚠️ Test creds | Returns "Insufficient Balance" (expected for test account) |
| Hotel Book | ⚠️ Untested | Requires production credentials |

**Credentials:**
- Flight: `RasaT` / `RasaT@123` / `ClientId: ApiIntegrationNew`
- Hotel: `TBOStaticAPITest` / `Tbo@11530818` (test creds, no balance for booking)

### Booking Pipeline (in UI)

1. Search hotels → select hotel → view rooms
2. Click "Book Now" → login check → `HotelBookingModal`
3. Fill guest details → "Confirm Booking"
4. Block (price verify) → Book (TBO confirm) → Save (Supabase `/api/bookings`)
5. Confirmation shown

---

## 17. Authentication System

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

## 18. App Pages

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

## 19. Admin Panel

- Route: `/admin/*`
- Layout: `admin/layout.tsx` — role check (ADMIN/SUPER_ADMIN), sidebar from DB
- Pages: dashboard, leads, b2b, packages, promos, users, loyalty

---

## 20. Legacy Code (packages/)

Not the primary app. Old Vite+Express monorepo. Still referenced but should not be the focus of new work.

- `packages/frontend/` — React 19, Vite 6 (deployed to Netlify via `dist/`)
- `packages/backend/` — Express 4, Prisma 6 (deployed to Render via `packages/backend/.env`)

---

## 21. Seed Data & Demo Users

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

## 22. Key Architectural Notes

1. **Next.js v16** — not your training data's Next.js. Check `node_modules/next/dist/docs/` for breaking changes.
2. **Tailwind v4** — uses `@import "tailwindcss"` and `@theme` directive (CSS-based config, not JS).
3. **Motion** library — Framer Motion successor. Import from `motion/react`.
4. **Dual DB access** — Prisma (10 tables) + raw Supabase queries (27+ tables). Mixed.
5. **Inconsistent auth** — most API routes have no auth. Security concern for production.
6. **CI/CD via GitHub Actions** — `deploy-dev.yml` and `deploy-qa.yml` for staging environments.
7. **App Router** — Next.js App Router with `src/` directory.
8. **AGENTS.md** — exists in `gorasa-next/AGENTS.md`, currently just warns about Next.js version differences.
9. **Multi-environment** — 3 Vercel projects (prod, dev, qa) with separate databases (Supabase, NEON dev, NEON QA).

---

*End of GoRASA Configuration Reference. Generated 2026-06-09. Update this file when configuration changes.*

---

## 23. Staging Environments (Dev/QA)

> **Added:** 2026-06-12  
> **Purpose:** Isolated Development and QA environments for testing before production deployment.

### Architecture

```
Production:  gorasa-next  → main branch → Supabase (isubgeemvhvhnhikxbjb)
Development: dev-gorasa   → dev branch  → NEON (gorasa-dev)
QA:          qa-gorasa    → qa branch   → NEON (gorasa-qa)
```

### Vercel Projects

| Project | ID | Branch | Database | Root Dir | Build Command |
|---------|-----|--------|----------|----------|---------------|
| gorasa-next | `prj_WLoI80KaCmVZSudP17ohcPbzTpSe` | main | Supabase | gorasa-next/ | `npx prisma generate && npx next build` |
| dev-gorasa | `prj_BWE4hfy72DwYF39XamAwGYi3qg63` | dev | NEON gorasa-dev | gorasa-next/ | `npx prisma generate && npx next build` |
| qa-gorasa | `prj_j2eXtGEfgMZqUeTxlMjE0TCyyBwN` | qa | NEON gorasa-qa | gorasa-next/ | `npx prisma generate && npx next build` |

### Deployment URLs

| Environment | URL | Status |
|-------------|-----|--------|
| Production | https://gorasa-next.vercel.app | ✅ Active |
| Development | https://dev-gorasa-*.vercel.app | ✅ Active |
| QA | https://qa-gorasa-*.vercel.app | ✅ Active |

### NEON Databases

| Database | Host | Region | Tables | Rows | Status |
|----------|------|--------|--------|------|--------|
| gorasa-dev | ep-quiet-tooth-aiehj2mq.c-4.us-east-1.aws.neon.tech | US East | 29 | 210 | ✅ Active |
| gorasa-qa | ep-quiet-tooth-aiehj2mq.c-4.us-east-1.aws.neon.tech | US East | 28 | 210 | ✅ Active |

**Connection Strings (stored in GitHub environment secrets):**
```
DEV (pooled):  postgresql://neondb_owner:****@ep-quiet-tooth-aiehj2mq-pooler.c-4.us-east-1.aws.neon.tech/gorasa-dev?sslmode=require&pgbouncer=true
DEV (direct):  postgresql://neondb_owner:****@ep-quiet-tooth-aiehj2mq.c-4.us-east-1.aws.neon.tech/gorasa-dev?sslmode=require
QA  (pooled):  postgresql://neondb_owner:****@ep-quiet-tooth-aiehj2mq-pooler.c-4.us-east-1.aws.neon.tech/gorasa-qa?sslmode=require&pgbouncer=true
QA  (direct):  postgresql://neondb_owner:****@ep-quiet-tooth-aiehj2mq.c-4.us-east-1.aws.neon.tech/gorasa-qa?sslmode=require
```

### GitHub Actions Workflows

| Workflow | File | Trigger | Environment | Status |
|----------|------|---------|-------------|--------|
| Deploy Dev | `.github/workflows/deploy-dev.yml` | push to `dev` | Production – dev-gorasa | ✅ Working |
| Deploy QA | `.github/workflows/deploy-qa.yml` | push to `qa` | Production – qa-gorasa | ✅ Working |

**Workflow steps:**
1. Checkout code
2. Setup Node.js 24
3. Install dependencies (`npm install` in gorasa-next/)
4. Install Vercel CLI
5. Deploy to Vercel (`vercel deploy --prod --yes`)

### GitHub Environment Secrets

Both `Production – dev-gorasa` and `Production – qa-gorasa` have 13 secrets:

| Secret | Purpose | Source |
|--------|---------|--------|
| `DATABASE_URL` | NEON pooled connection | NEON dashboard |
| `DIRECT_URL` | NEON direct connection | NEON dashboard |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Supabase dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Supabase dashboard |
| `TBO_USERNAME` | TBO flight API login | TBO support |
| `TBO_PASSWORD` | TBO flight API password | TBO support |
| `TBO_HOTEL_USERNAME` | TBO hotel API login | TBO support |
| `TBO_HOTEL_PASSWORD` | TBO hotel API password | TBO support |
| `TBO_ENDPOINT` | TBO hotel API endpoint | TBO docs |
| `VERCEL_TOKEN` | Vercel deployment token | Vercel dashboard |
| `VERCEL_ORG_ID` | Vercel organization ID | Vercel API |
| `VERCEL_DEV_PROJECT_ID` / `VERCEL_QA_PROJECT_ID` | Vercel project ID | Vercel API |

### How to Deploy

```bash
# Deploy to Development
git checkout dev
# make changes...
git push neworigin dev  →  GitHub Action → dev-gorasa.vercel.app

# Deploy to QA
git checkout qa
git merge dev
git push neworigin qa   →  GitHub Action → qa-gorasa.vercel.app

# Deploy to Production
git checkout main
git merge qa
git push neworigin main →  Vercel auto-deploy → gorasa-next.vercel.app
```

### Database Sync

When new tables are added to Supabase, run the sync script to update NEON databases:

```bash
cd /home/nikhil/Downloads/Gorasa/App-1/rasa-zero-app-main/gorasa-next

# Sync schema to dev
node ../scripts/create-full-schema.js "postgresql://neondb_owner:****@ep-quiet-tooth-aiehj2mq.c-4.us-east-1.aws.neon.tech/gorasa-dev?sslmode=require"

# Sync schema to QA
node ../scripts/create-full-schema.js "postgresql://neondb_owner:****@ep-quiet-tooth-aiehj2mq.c-4.us-east-1.aws.neon.tech/gorasa-qa?sslmode=require"

# Copy data from Supabase to NEON
node ../scripts/migrate-via-sql.js "postgresql://neondb_owner:****@ep-quiet-tooth-aiehj2mq-pooler.c-4.us-east-1.aws.neon.tech/gorasa-dev?sslmode=require&pgbouncer=true"
node ../scripts/migrate-via-sql.js "postgresql://neondb_owner:****@ep-quiet-tooth-aiehj2mq-pooler.c-4.us-east-1.aws.neon.tech/gorasa-qa?sslmode=require&pgbouncer=true"
```

### Vercel Project Settings (API)

```bash
# Set root directory (if reset)
VERCEL_TOKEN="vca_****"
curl -X PATCH "https://api.vercel.com/v1/projects/<PROJECT_ID>?teamId=team_0pR3Xnbjx12q8H8pZF9xgE5S" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rootDirectory":"gorasa-next","buildCommand":"npx prisma generate && npx next build","framework":"nextjs"}'

# Disable SSO protection (for public access)
curl -X PATCH "https://api.vercel.com/v1/projects/<PROJECT_ID>?teamId=team_0pR3Xnbjx12q8H8pZF9xgE5S" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ssoProtection":null}'
```

### Scripts

| Script | Purpose | Location |
|--------|---------|----------|
| `create-full-schema.js` | Creates all tables in NEON matching Supabase schema | `gorasa-next/` |
| `migrate-via-sql.js` | Copies data from Supabase to NEON via SQL | `gorasa-next/` |
| `fix-schema.js` | Adds missing columns to NEON tables | `gorasa-next/` |
| `create-neon-dbs.js` | Creates gorasa-dev and gorasa-qa databases in NEON | `gorasa-next/` |
| `setup-github-secrets.sh` | Helper script for GitHub environment secrets | `scripts/` |
| `export-supabase-schema.sh` | Exports Supabase schema using pg_dump | `scripts/` |
| `verify-migration.js` | Verifies row counts match between databases | `scripts/` |

### Security Notes

- NEON connection strings are stored in **GitHub environment secrets** (not in code)
- Vercel environment variables are set per-project in Vercel dashboard
- SSO protection is disabled for staging projects (public access)
- All projects share the same Supabase credentials for auth
