# GoRASA Project Memory

> **Purpose:** Persistent cross-session context. Updated at the end of every significant work session.
> **Last updated:** 2026-06-12 02:00 IST

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
4. Internal beta readiness — **IN PROGRESS**

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
| No CI/CD pipeline | Manual git push → Vercel auto-deploy |
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

