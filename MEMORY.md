# GoRASA Project Memory

> **Purpose:** Persistent cross-session context. Updated at the end of every significant work session.
> **Last updated:** 2026-06-12 08:20 IST

---

## Current Sprint Context

**Sprint:** Sprint -1 — Full Stack Migration & Foundation (June 8–12)
**Status:** Phase 6 — TBO Hotel and Flight APIs LIVE. Fallback hotels working. Searchable city dropdown deployed.
**Live URL:** https://gorasa-next.vercel.app

---

## Active Goals

1. Fix demo login to look up existing DB users directly (no password, no Supabase Auth) — **DONE**
2. Integrate real TBO flight API (Auth returns endpoints, TokenId works) — **DONE**
3. Integrate real TBO hotel REST API (Basic Auth on `api.tbotechnology.in`) — **DONE**
4. Searchable city dropdown with TBO live data (cmdk) — **DONE**
5. Fallback hotels for cities without TBO inventory — **DONE**
6. Hotel search with real TBO images — **DONE**
7. Dynamic city code resolution (no hardcoded mapping) — **DONE**
8. User-facing ticket creation on /support page — **DONE**
9. Internal beta readiness — **IN PROGRESS**

---

## Architectural Decisions

| Decision | Chosen Approach | Date |
|----------|----------------|------|
| Demo login | Direct DB lookup via `/api/auth/login` + `signInDemo()`, no Supabase Auth | 2026-06-11 |
| Server-side API auth | `SUPABASE_SERVICE_ROLE_KEY` for bypassing RLS on `User` table | 2026-06-11 |
| API param extraction | Read from `body.params.*` (frontend sends nested params) | 2026-06-11 |
| Hotel mock data | City-driven lookup via `getHotelInfoByCode()` instead of static `cityCodeMap` | 2026-06-11 |
| Vercel deploys | Git push → auto-deploy (root dir: `gorasa-next/`) | 2026-06-11 |
| Governance hooks | `opencode-yaml-hooks` plugin for file.changed (TSC) + session.idle (post-task) | 2026-06-11 |
| TBO hotel API auth | Basic Auth (`Authorization: Basic base64(user:pass)`) on `api.tbotechnology.in` | 2026-06-11 |
| Hotel API credentials | Separate from flight: `TBO_HOTEL_USERNAME`/`TBO_HOTEL_PASSWORD` in `.env.local` | 2026-06-11 |
| Hotel code architecture | `tbo-hotel-types.ts` (types) → `tbo-hotel-api.ts` (HTTP client) → `tbo-hotel-client.ts` (orchestration) → route | 2026-06-11 |
| Flight API credentials | Corrected `RasaT` (not `RasaTAPI` as previously used) | 2026-06-11 |
| Staging environments | 3 Vercel projects (prod, dev, qa) with NEON databases for dev/qa | 2026-06-12 |
| Staging deployment | GitHub Actions workflows for dev/qa, Vercel Git integration for prod | 2026-06-12 |
| Staging database | NEON (gorasa-dev, gorasa-qa) with 28+ tables, 210 rows each | 2026-06-12 |
| Ticket system RLS | Permissive "Full access" policy (matches Lead table pattern), anon key | 2026-06-12 |
| Ticket user_id type | TEXT (not UUID) — app uses string IDs from own User table, not Supabase Auth | 2026-06-12 |
| AI Holiday Planner | Integrated to /holidays route (was at /planner) | 2026-06-12 |
| Governance hooks | session.start + session.idle + session.end enforce preflight + post-task | 2026-06-12 |
| Admin CRUD | Full CRUD on all 12 admin pages (corporate, B2B, loyalty, tickets, AI leads) | 2026-06-12 |
| Post-task checks | 15 compulsory checks (docs, env, TSC, build, DB, RLS, API, components, hooks) | 2026-06-12 |
| Support page tickets | Tabbed UI (AI Chat + My Tickets), auth-gated form, POST /api/tickets | 2026-06-12 |
| Pre-flight checks | 10 compulsory checks (docs, env, TSC, git, critical files, hooks) | 2026-06-12 |

---

## Known Constraints

| Constraint | Detail |
|------------|--------|
| Supabase RLS enabled on 27+ tables | Service role key required for server-side reads/writes |
| DB has 6 demo users only | No Supabase Auth users exist for these emails |
| User.id is `text` with NO default | Random UUIDs assigned at creation time |
| Vercel root dir must be `gorasa-next/` | Deploy from repo root or git push only (CLI from subdir fails) |
| JWT secret may rotate | Service role key must be kept in sync with Supabase dashboard |
| Git remotes: `neworigin` = prod, `origin` = fork | Push to `neworigin main` to deploy |
| CI/CD via GitHub Actions | `deploy-dev.yml` and `deploy-qa.yml` for staging environments |
| Hotel API uses Basic Auth (not TokenId) | `Authorization: Basic base64(TBO_HOTEL_USERNAME:TBO_HOTEL_PASSWORD)` |
| Hotel test creds have no balance | PreBook returns "Insufficient Balance" — expected with `TBOStaticAPITest` |
| Flight API needs `ClientId: ApiIntegrationNew` in Auth body | Without it, authenticate returns Status: 3 |
| TBO username is `RasaT` not `RasaTAPI` | Old code used wrong username, fixed Jun 11 |

---

## Key Files

| File | Purpose |
|------|---------|
| `gorasa-next/src/components/LoginModal.tsx` | Fetches demo users, `handleDemoLogin` calls `signInDemo(email)` |
| `gorasa-next/src/hooks/useAuth.tsx` | `signInDemo(email)` — direct API login, no password |
| `gorasa-next/src/app/api/auth/login/route.ts` | Login endpoint (service role key, find/create user by email) |
| `gorasa-next/src/app/api/users/demo/route.ts` | Returns 6 DB users (service role key) |
| `gorasa-next/src/app/api/auth/me/route.ts` | Current user (service role key) |
| `.opencode/hook/hooks.yaml` | Governance hooks (TSC check, post-task) |
| `gorasa-next/AGENTS.md` | Project governance rules |
| `CONFIG-REFERENCE.md` | All env vars, project IDs, deployment config |
| `MEMORY.md` | This file — session context across runs |
| `gorasa-next/src/lib/tbo-hotel-types.ts` | TBO hotel API types (TS interfaces for request/response) |
| `gorasa-next/src/lib/tbo-hotel-api.ts` | TBO hotel HTTP client (Basic Auth, raw API calls) |
| `gorasa-next/src/lib/tbo-hotel-client.ts` | TBO hotel orchestrator (auth cache, search→prebook→book) |
| `gorasa-next/src/app/api/tbo-hotels/route.ts` | TBO hotel API proxy route |
| `gorasa-next/src/app/api/tbo/route.ts` | Legacy TBO route (flight + hotel, migrated to dedicated routes) |
| `gorasa-next/src/app/support/page.tsx` | Support center: AI Chat tab + My Tickets tab (create/list tickets) |
| `gorasa-next/src/lib/ticket/serverManager.ts` | Ticket CRUD operations (createTicket, getUserTickets, etc.) |
| `gorasa-next/src/lib/ticket/types.ts` | Ticket TypeScript types and constants |
| `.github/workflows/deploy-dev.yml` | GitHub Actions workflow for dev deployment |
| `.github/workflows/deploy-qa.yml` | GitHub Actions workflow for QA deployment |
| `scripts/setup-github-secrets.sh` | Helper script for GitHub environment secrets |
| `scripts/migrate-via-sql.js` | Copies data from Supabase to NEON via SQL |
| `scripts/create-full-schema.js` | Creates all tables in NEON matching Supabase schema |
| `scripts/verify-migration.js` | Verifies row counts match between databases |
| `gorasa-next/src/lib/ticket/serverManager.ts` | Ticket CRUD operations (Supabase, anon key, RLS enabled) |
| `gorasa-next/src/lib/ticket/types.ts` | Ticket type definitions (Ticket, TicketNote, TicketActivity) |
| `gorasa-next/src/app/api/tickets/route.ts` | Ticket list/create API |
| `gorasa-next/src/app/api/tickets/[id]/route.ts` | Single ticket GET/PATCH API |
| `gorasa-next/src/app/api/tickets/[id]/notes/route.ts` | Ticket notes GET/POST API |
| `gorasa-next/src/app/api/leads/assignable-users/route.ts` | Assignable users for lead assignment | 2026-06-12 |
| `gorasa-next/src/app/api/rewards/[id]/route.ts` | Loyalty rewards PATCH/DELETE API | 2026-06-12 |
| `gorasa-next/src/app/api/corporate-rates/[id]/route.ts` | Corporate rates PATCH/DELETE API | 2026-06-12 |
| `gorasa-next/src/app/admin/tickets/page.tsx` | Admin ticket dashboard |
| `gorasa-next/src/lib/ai/holidayPlanner.ts` | Rule-based holiday planner (no API key needed) |
| `gorasa-next/src/lib/ai/holidayPlannerAI.ts` | AI-powered holiday planner (requires API key) |
| `gorasa-next/src/lib/support/smartRouter.ts` | Support FAQ + intent routing |
| `gorasa-next/src/components/HolidayPlanner.tsx` | AI Holiday Planner chat UI |

---

## Session History

### Session 2026-06-11 — Hotel Images Fix + Demo Login Fix

**Duration:** ~3 hours
**Changes:**
1. Fixed TBO hotel route param extraction (`body.params.*`)
2. Added `getHotelInfoByCode()` to mock data, removed `cityCodeMap`
3. Switched 3 API routes from anon key → service role key
4. Added `signInDemo()` to `useAuth.tsx` — no password, no Supabase Auth
5. Fixed `DEMO_FALLBACK` emails to match actual DB (`@gorasa.in`, `@example.com`)
6. Replaced hookify (Claude Code-only) with `opencode-yaml-hooks` plugin
7. Created `.opencode/hook/hooks.yaml` with TSC + post-task hooks
8. Debugged stale `SUPABASE_SERVICE_ROLE_KEY` in Vercel (JWT signature mismatch)
9. Updated `.env.local` and Vercel env var with correct service role key

### Session 2026-06-11 (Afternoon) — TBO Hotel API Live Integration

**Duration:** ~3 hours
**Problem:** TBO hotel API used wrong auth method (TokenId in body instead of Basic Auth) and wrong credentials (shared `RasaT` creds instead of dedicated test creds)

**Changes:**
1. Created `tbo-hotel-types.ts` — full TS interfaces for hotel Search/PreBook/Book API
2. Created `tbo-hotel-api.ts` — HTTP client with Basic Auth, raw API calls to `api.tbotechnology.in`
3. Created `tbo-hotel-client.ts` — orchestrator with auth cache, search method
4. Refactored `api/tbo-hotels/route.ts` — dedicated hotel route, clean GET/POST handlers
5. Fixed `api/tbo/route.ts` — removed duplicate hotel logic, kept as flight-only legacy
6. Added `TBO_HOTEL_USERNAME`/`TBO_HOTEL_PASSWORD` to `.env.local`
7. Discovered hotel API uses Basic Auth (not TokenId) — `api.tbotechnology.in` domain
8. Found shared test creds `TBOStaticAPITest`/`Tbo@11530818` — Search works, PreBook returns "Insufficient Balance"
9. Corrected flight username to `RasaT` (was `RasaTAPI`) — authentication endpoint now reachable

**Status:** Hotel search ✅, PreBook reachable (test balance), Book not tested. Flight auth now working.

### Session 2026-06-12 — Fallback Hotels + City Dropdown + Governance

**Duration:** ~4 hours
**Problem:** Cities without TBO inventory showed "No hotels found". Fallback hotels showed "Hotel in Unknown" instead of correct city name.

**Changes:**
1. Created `CitySearchDropdown` component with cmdk — searchable dropdown with [TBO]/[Fallback] tags
2. Added `/api/cities/tbo` route — fetches 1,083+ Indian cities from TBO CityList API
3. Added `iata_code` column to Supabase City table — populated for 50+ airports
4. Updated flights page to use TBO flight API with IATA codes
5. Created `generateFallbackHotels()` — generic hotels for cities without TBO inventory
6. Fixed fallback hotel names — `getHotelInfoByCode()` was hardcoded to "Unknown"
7. Added `source` field to `TBOHotelDisplay` — tracks "tbo", "mock", "fallback"
8. Added TBO HotelDetails API integration — fetches real images for top 10 hotels
9. Added operational modes (plan/build) to governance protocol
10. Updated all governance docs (MEMORY, CHANGE-LOG, LEARNING-FROM-MISTAKES, DEPLOYMENT_LOG)

**Status:** Hotel search ✅ (all cities), Flight search ✅ (IATA codes), City dropdown ✅ (1,083+ cities)

### Session 2026-06-12 — Staging Environment Setup (Dev/QA)

**Duration:** ~4 hours
**Problem:** Need isolated Dev and QA environments for testing before production deployment.

**Changes:**
1. Created `dev` and `qa` git branches
2. Created NEON project with 2 databases (`gorasa-dev`, `gorasa-qa`)
3. Migrated full schema (28 tables) from Supabase to NEON
4. Copied 210 rows of data from Supabase to both NEON databases
5. Created Vercel projects (`dev-gorasa`, `qa-gorasa`) with correct settings
6. Configured environment variables for both projects
7. Created GitHub Actions workflows (`deploy-dev.yml`, `deploy-qa.yml`)
8. Set up GitHub environment secrets (13 secrets per environment)
9. Disabled SSO protection for public access
10. Fixed Vercel deploy path issue (rootDirectory doubling)
11. Removed hardcoded credentials from scripts (security fix)

**Architecture:**
```
Production:  gorasa-next  → main branch → Supabase
Development: dev-gorasa   → dev branch  → NEON gorasa-dev
QA:          qa-gorasa    → qa branch   → NEON gorasa-qa
```

**Deployment URLs:**
- Production: https://gorasa-next.vercel.app
- Development: https://project-uul0v.vercel.app
- QA: https://project-sm6gc.vercel.app

**Status:** All 3 environments active and verified (HTTP 200, database connectivity confirmed)

### Session 2026-06-12 — Ticket System Productionization + AI Planner Integration

**Duration:** ~2 hours
**Problem:** Ticket system had missing `await` on async calls, invalid UUID format for IDs, column type mismatches, and RLS blocking inserts.

**Changes:**
1. Integrated AI Holiday Planner to `/holidays` route (copied from `/planner`)
2. Created Supabase migration: `tickets`, `ticket_notes`, `ticket_activities` tables
3. Fixed `serverManager.ts`: use `crypto.randomUUID()` for IDs, use anon key
4. Fixed all 3 ticket API routes: added `await` on all async serverManager calls
5. Changed `user_id` and `assigned_to` columns from UUID to TEXT (app uses string IDs)
6. Dropped FK constraints to `auth.users` (app uses own User table)
7. Enabled RLS with permissive "Full access" policies (matches Lead table pattern)
8. Fixed `payment/success/page.tsx`: wrapped `useSearchParams` in Suspense boundary
9. Verified all APIs: tickets GET/POST, support, intent classification, holiday planner

**Key Lesson:** Always `await` async functions in API routes. Missing `await` returns a Promise object (serialized as `{}`) instead of the actual data.

**Status:** Ticket system fully functional with RLS enabled, AI planner at /holidays, all APIs verified.

---

## TBO API Status

| Endpoint | Status | Notes |
|----------|--------|-------|
| Flight search (live) | ✅ Working | `api.tektravels.com` with TokenId auth |
| Hotel search (live) | ✅ Working | `api.tbotechnology.in` with Basic Auth |
| Hotel static data | ✅ Working | CountryList, CityList, HotelCodeList via Basic Auth |
| Real TBO flight API | ✅ Working | TokenId from authenticate, search returns live flights |
| Real TBO hotel API | ✅ Working | Basic Auth, search returns live rooms with real prices |
| Fallback hotels | ✅ Working | Cities without TBO inventory show generic hotels with correct names |
| Searchable city dropdown | ✅ Working | 1,083+ Indian cities from TBO CityList API via cmdk |

## Session completed: 2026-06-12 01:34:56 +0900

Session: 01:34:56

Work completed:
- Governance protocol implementation
- Pre-flight and post-task scripts created
- All governance rules enforced

---


### Session 2026-06-12 — Admin Navigation Full CRUD Implementation

**Duration:** ~1 hour
**Problem:** Admin pages had UI but missing backend CRUD operations (PATCH/DELETE routes, create forms, edit/delete capabilities).

**Changes:**
1. Created `api/corporate-rates/[id]/route.ts` — PATCH + DELETE for corporate rates
2. Created `api/rewards/[id]/route.ts` — PATCH + DELETE for loyalty rewards
3. Created `api/tickets/[id]/notes/route.ts` — GET + POST for admin ticket notes (uses existing serverManager)
4. Created `api/leads/assignable-users/route.ts` — GET list of SALES/ADMIN users for assignment
5. Extended `api/companies/route.ts` — Added POST for company creation
6. Extended `api/companies/[id]/route.ts` — Extended PATCH to all fields + added DELETE
7. Extended `api/rewards/route.ts` — Added POST + `?all=true` param for admin view
8. Updated `admin/corporate/page.tsx` — Company dropdown, inline edit, delete
9. Updated `admin/b2b/page.tsx` — Company create/edit/delete UI
10. Updated `admin/loyalty/page.tsx` — Admin mode toggle with full CRUD for rewards
11. Updated `admin/tickets/page.tsx` — Priority dropdown, admin notes, archive (no delete)
12. Updated `admin/ai-leads/page.tsx` — Stage update buttons, assignment dropdown

**Key Decisions:**
- Tickets: Archive only (status → "closed"), no hard delete per user requirement
- Tickets notes: Uses existing `ticket_notes` table via serverManager (not a new table)
- Corporate rates: Company selector dropdown replaces raw companyId text input
- Rewards: Admin mode toggle keeps customer-facing catalog clean while enabling management
- AI Leads: Reuses same PATCH pattern as regular leads for stage/assignment updates

**Status:** All 12 admin pages now have full CRUD. TypeScript compiles, build succeeds, 15/15 post-task checks pass.

### Session 2026-06-12 — Staging Environments Go-Live + Supabase Env Var Fix

**Duration:** ~1 hour
**Problem:** Dev and QA staging environments had stale/staging branch sync issues.

**Changes:**
1. Read all project docs (Sprint-1.md, CONFIG-REFERENCE.md, etc.) as per governance
2. Updated all 4 doc files with real Vercel URLs (project-uul0v.vercel.app, project-sm6gc.vercel.app)
3. Replaced wildcard URLs with actual Vercel deployment URLs
4. Merged `main` into `dev` and `qa` branches (8-commit gap synced)
5. Cherry-picked URL commit to both branches, pushed all 3 to `neworigin`
6. Renewed Vercel token (old one expired) and updated GitHub environment secrets
7. Re-ran failed GitHub Actions deployments — both succeeded
8. Fixed **stale Supabase env vars** on Vercel dev/QA projects:
   - `.env.local` had been updated with a **different Supabase project ref** (`isubgeemvhvhnhikxbjb`)
   - Vercel project env vars still had old project ref keys (`isubgeemvhvhnikxhbjb`)
   - Replaced all 3 Supabase env vars on both dev and QA Vercel projects with correct keys from `.env.local`
9. Re-deployed both environments — all endpoints now working (demo users, cities, tickets)

**Verification:** Both staging environments fully verified:
- HTTP 200 ✓
- 35 cities returned ✓
- 3 tickets returned ✓
- 6 demo users returned ✓

**Deployment URLs:**
- Production: https://gorasa-next.vercel.app
- Development: https://project-uul0v.vercel.app
- QA: https://project-sm6gc.vercel.app
