# Learning from Mistakes — GoRASA Development Log

> **Purpose:** Document every significant issue encountered, root cause analysis, resolution steps, and lessons learned to prevent recurrence.

> **Last updated:** June 11, 2026

---

## Issue #1: Homepage Carousels Not Rendering (Phase 6)

**Date:** June 8-9, 2026
**Duration:** ~8 hours of debugging
**Severity:** Critical — homepage completely blank

### Symptoms
- Homepage showed only hero section and corporate travel section
- All dynamic sections (carousels, value props, testimonials, navbar) were blank
- Loading spinner persisted indefinitely
- APIs returned correct data via curl

### Root Cause (Multiple Issues)

1. **Column name casing mismatch** — Phase 2/3 SQL migrations created tables with lowercase columns (`isactive`, `sortorder`, `badgecolor`) but API routes used camelCase (`isActive`, `sortOrder`, `badgeColor`)

2. **Footer direct Supabase queries** — Footer was an async server component rendered inside a client component (`HomePageClient`), causing direct Supabase requests from browser that overwhelmed free tier (`ERR_INSUFFICIENT_RESOURCES`)

3. **Promise.all fragility** — First two fetches had no `.catch()` handler, so if either failed, ALL state updates were skipped silently

4. **motion/react initial opacity** — All motion elements had `initial={{ opacity: 0 }}` which made content invisible on SSR. If client-side JS failed to hydrate, everything stayed invisible

5. **Wrong Supabase client in server component** — Homepage used browser client (`supabase.ts`) instead of server client (`supabase-server.ts`)

6. **Dashboard query wrong column** — `User` table has `companyId` not `company`, causing Promise.all to reject

### Resolution Steps

1. Fixed column casing in 10 API routes (lowercase → camelCase mapping)
2. Converted Footer from async server component to client component with API routes
3. Added `.catch()` to all Promise.all fetches with error logging
4. Changed `initial={{ opacity: 0 }}` to `initial={{ opacity: 1 }}` in all motion elements
5. Changed homepage to use server-side Supabase client
6. Fixed dashboard query to use `companyId` instead of `company`

### Lessons Learned

1. **Always verify DB column names match API queries** — PostgreSQL folds unquoted identifiers to lowercase. SQL migrations must quote column names or API routes must use lowercase.

2. **Server components inside client components run on client** — In Next.js App Router, a server component rendered inside a client component runs on the client side, not server side.

3. **Promise.all is fragile without individual catches** — If any fetch fails without `.catch()`, the entire Promise.all rejects and ALL state updates are skipped.

4. **motion/react initial opacity hides content on SSR** — Content with `initial={{ opacity: 0 }}` is invisible until client-side JS hydrates and triggers animations.

5. **Always check Vercel build logs on failure** — The build log showed the exact error (`column "isActive" does not exist`), but I didn't check it initially.

6. **Use the correct Supabase client for the context** — Browser client for client components, server client for server components.

### Prevention Measures

1. Add ESLint rule to warn on direct Supabase queries in components rendered inside client components
2. Add `.catch()` to all fetch calls in useEffect
3. Use `initial={{ opacity: 1 }}` for SSR-rendered content
4. Always verify DB column names before writing API queries
5. Check Vercel build logs immediately on deployment failure

---

## Issue #2: Vercel Deployment Failures

**Date:** June 8, 2026
**Duration:** ~2 hours
**Severity:** Medium — deployment blocked

### Symptoms
- Vercel deployments stuck in "UNKNOWN" status
- Build failed with "No Next.js version detected"

### Root Cause
- Vercel project `rootDirectory` was set to `.` (repo root) but Next.js app was in `gorasa-next/` subdirectory
- Build ran from repo root where `package.json` didn't have `next` as dependency

### Resolution
- Set `rootDirectory` to `gorasa-next` via Vercel API
- Created `vercel.json` with `rootDirectory` (invalid property, caused schema error)
- Fixed by using API instead of vercel.json

### Lessons Learned
1. **Vercel `rootDirectory` is not a valid vercel.json property** — Must be set via API or dashboard
2. **Monorepo structure requires explicit root directory configuration** — Vercel can't auto-detect which subdirectory contains the app

---

## Issue #3: Hardcoded Data Migration

**Date:** June 8, 2026
**Duration:** ~6 hours
**Severity:** High — all data hardcoded, not from database

### Symptoms
- Homepage carousels showed hardcoded package data
- Navbar, footer, testimonials all hardcoded
- No data from Supabase database

### Root Cause
- Original app used hardcoded data files (`packages-data.ts`, `travel-data.ts`)
- Homepage was a client component fetching from API routes
- API routes queried Supabase but data wasn't being passed correctly

### Resolution
1. Created 11 new Supabase tables (City, PackageCategory, ValueProposition, etc.)
2. Created 11 new API routes
3. Converted homepage to server component with ISR
4. All data now fetched from Supabase database

### Lessons Learned
1. **Server components are better for data-heavy pages** — Eliminates loading states, better SEO, no race conditions
2. **ISR caching reduces database load** — 5-minute cache means ~288 queries/day instead of per-visitor
3. **Always plan database schema before coding** — Column naming conventions (camelCase vs lowercase) must be consistent

---

## Issue #4: Supabase Free Tier Limits

**Date:** June 9, 2026
**Duration:** ~1 hour
**Severity:** Medium — browser errors, slow page loads

### Symptoms
- `ERR_INSUFFICIENT_RESOURCES` in browser console
- Page loads slow or fail
- Footer not rendering

### Root Cause
- Footer was async server component rendered inside client component
- Caused direct Supabase requests from browser
- Supabase free tier overwhelmed by too many concurrent requests

### Resolution
- Converted Footer to client component
- Fetches data via API routes instead of direct Supabase queries

### Lessons Learned
1. **Never query Supabase directly from browser components** — Always use API routes as proxy
2. **Free tier has connection limits** — Plan for concurrent request limits
3. **Server components inside client components run on client** — This is a Next.js gotcha

---

## Issue #5: Hotel Images Not Loading in Frontend

**Date:** June 11, 2026
**Duration:** ~2 hours (initial investigation) + ~30 min (corrective fix)
**Severity:** High — images display as blanks in production

### Symptoms
- Hotel search results show blank images
- Frontend renders empty picture area
- Unsplash URLs exist in API response but are empty
- Mock data has correct `imageUrl` fields

### Root Cause (Revised June 11)
- **Wrong initial diagnosis** — originally thought frontend wasn't consuming `picture` field
- **Real cause:** Commit `53f7720` (Hotel REST API rewrite) changed route param extraction from `body.params` (`const params = body.params`) to destructuring from `body` root (`const { cityName } = body`)
- Frontend sends params nested under `body.params`: `{ action: "search", params: { CityName, ... } }`
- Route always received `cityName = undefined` → mock path couldn't find hotel info → `picture = ""`
- **Secondary mistake:** My `cb1628b` commit added `cityCodeMap` complexity on top of broken param extraction instead of fixing the route

### Resolution Steps
1. Fixed `gorasa-next/src/app/api/tbo/route.ts` — extract search params from `body.params.CityName`, `body.params.CheckInDate`, `body.params.CheckOutDate`, `body.params.RoomGuests`
2. Added `getHotelInfoByCode()` to `tbo-hotel-mock.ts` — searches all cities for hotel info by code
3. Removed `cityCodeMap` from `tbo-hotel-client.ts` mock fallback — replaced with direct `getHotelInfoByCode` lookup
4. Verified TypeScript compilation passes

### Lessons Learned
1. **Root cause before adding complexity** — Always fix the root problem before adding workarounds
2. **API param structure matters** — If frontend nests params under `body.params`, the route must extract from there
3. **Don't assume param names match** — Frontend sends `CityName` (camelCase), route read `cityName` (lowercase), different field entirely
4. **City code lookup tables are fragile** — They break when city name isn't passed through
5. **Generate Context Brief before debugging** — Initial 2-hour investigation was misdirected without structured analysis

### Prevention Measures
1. Add API route tests that verify param extraction from nested body structure
2. Type-check request body structure against what route actually destructures
3. Always trace the full data flow: Frontend → Route → Client → Mock before coding
4. Never add lookup tables or mapping complexity before confirming the param pipeline is intact

---

## Issue #6: Demo Login Fails — Supabase Auth + Wrong Fallback Emails + Stale Service Key

**Date:** June 11, 2026
**Duration:** ~2 hours (1h auth fix + 1h stale JWT debug)
**Severity:** High — blocks quick access to the app, entire flow broken

### Symptoms
- Clicking demo user buttons showed "Invalid login credentials"
- After fixing Supabase Auth fallback, showed "Failed to create user" (42501 RLS)
- After switching to service role key, showed "Failed to create user" / "Failed to fetch demo users" with "Invalid API key"
- Demo login buttons showed wrong email addresses

### Root Cause Analysis — 3 Phases

**Phase 1: Wrong auth approach**
- `signInWithEmail` called `supabase.auth.signInWithPassword` — no Supabase Auth user exists for demo accounts (they're only in the `User` DB table)

**Phase 2: Anon key + RLS**
- Three API routes used `NEXT_PUBLIC_SUPABASE_ANON_KEY` → anonymous role → RLS blocked User table → `42501: new row violates row-level security`

**Phase 3: Stale JWT signature**
- After switching to `SUPABASE_SERVICE_ROLE_KEY`, Vercel logs showed `Invalid API key`
- The env var value had a JWT with a signature that did not match the project's current JWT secret
- `.env.local` had also been updated at some point with an invalid signature
- Root cause: The Supabase project's JWT secret was rotated (or the key was manually entered wrong), but `.env.local` and Vercel were never updated with the correct signature

### Resolution
1. **Added `signInDemo()` to `useAuth.tsx`** — Direct API call with just `{email}`, no Supabase Auth, no password
2. **Fixed `DEMO_FALLBACK` emails** — Changed to match DB users (`hmittal@gorasa.in`, `admin@gorasa.in`, `sales@gorasa.in`, `neha@corp.in`, `amit@example.com`, `priya@example.com`)
3. **Switched to `SUPABASE_SERVICE_ROLE_KEY`** — All 3 API routes use service role key
4. **Got correct service key from Supabase dashboard** — Replaced stale JWT in Vercel env + `.env.local`

### Lessons Learned
1. **Don't mix Auth flow with simple DB lookup** — Demo users should skip Supabase Auth entirely
2. **Fallback data must match production** — Hardcoded demo emails that don't match the database cause confusing failures
3. **Environment variable values can go stale** — A key that was once valid can become invalid if the JWT secret is rotated
4. **Always verify with local test first** — Testing the key locally (`createClient(url, key).from('User').select()`) definitively shows if the key is valid vs. an RLS/network issue

### Prevention Measures
1. Demo login should always use a dedicated path (no Supabase Auth, no password)
2. Fallback/seed data should match actual DB records or be auto-generated from the same source
3. Verify `SUPABASE_SERVICE_ROLE_KEY` in both `.env.local` AND Vercel by running a test query
4. Add a health-check script that validates Supabase keys return expected data

---

## Issue #7: TBO Hotel API Auth Mismatch (Wrong Endpoint + Wrong Credentials)

**Date:** June 11, 2026
**Duration:** ~3 hours
**Severity:** High — blocked live hotel search

### Symptoms
- Hotel search endpoint returned `Status: 3` ("No Result") or empty results
- Browser hotel search showed "No hotels found"
- Auth endpoint returned success (TokenId), but hotel search with TokenId returned Status: 3
- `api.tektravels.com` hotel endpoint returned `Status: 500` or `Method not found`
- The `api.tbotechnology.in` endpoint returned `401 Unauthorized` with shared flight credentials

### Root Cause (3 layers)

1. **Wrong auth method** — The hotel API at `api.tbotechnology.in` uses **Basic Auth** (`Authorization: Basic base64`), NOT the TokenId-in-body pattern used by the flight API at `api.tektravels.com`
   - Old code passed `TokenId` in the request body (flight pattern)
   - Hotel API requires `UserName` + `Password` in the body AND Basic Auth header
   
2. **Wrong credentials** — The shared TBO flight credentials (`RasaT`/`RasaT@123`) are for `api.tektravels.com` only
   - Hotel domain `api.tbotechnology.in` uses separate test credentials: `TBOStaticAPITest`/`Tbo@11530818`
   - These are shared test credentials provided by TBO support, NOT our production account
   
3. **Wrong username** — Even the flight credentials had the wrong username: code used `RasaTAPI` but official TBO credentials are `RasaT`
   - This caused flight authenticate endpoint to return `Status: 3`

### Resolution Steps

1. **Identified correct auth method** — Read TBO hotel API docs, confirmed Basic Auth pattern
2. **Created dedicated hotel API module**:
   - `tbo-hotel-types.ts` — typed interfaces for Search/PreBook/Book requests and responses
   - `tbo-hotel-api.ts` — raw HTTP client with Basic Auth, handles XML envelope for static data
   - `tbo-hotel-client.ts` — orchestrator with auth cache, search→prebook→book pipeline
3. **Corrected credentials**:
   - Added `TBO_HOTEL_USERNAME`/`TBO_HOTEL_PASSWORD` to `.env.local` for hotel API
   - Fixed flight username from `RasaTAPI` to `RasaT` in `.env.local` and TBO hotel client
4. **Updated `.env.local`** with both credential sets
5. **Verified hotel search** returned rooms for Goa/Mumbai/Delhi
6. **PreBook tested** — returns "Insufficient Balance" (expected for test credentials)

### Lessons Learned

1. **Never assume auth method** — Different API endpoints for the same provider can use completely different auth schemes (TokenId vs Basic Auth)
2. **Check domain ownership** — `api.tektravels.com` (flight) and `api.tbotechnology.in` (hotel) are different companies; they don't share auth
3. **Verify credentials with TBO support** — The username `RasaTAPI` was a guess; official creds are `RasaT`
4. **Read the API docs carefully** — Hotel API docs specify Basic Auth + `UserName`/`Password` in body, not TokenId
5. **Test each endpoint in isolation** — curl hotel endpoint directly before integrating into full pipeline
6. **Separate env vars for separate APIs** — Don't reuse `TBO_USERNAME`/`TBO_PASSWORD` for both flight and hotel
7. **Use base64 encoding correctly** — `Buffer.from(`${user}:${pass}`).toString('base64')` for Basic Auth

### Prevention Measures
1. Always read the API documentation for auth method before coding
2. Test each credential set independently with curl before integrating
3. Use separate env var names for separate API providers (`TBO_HOTEL_*` vs `TBO_*`)
4. Add API doc reference to code comments
5. When TBO support provides test credentials, use them verbatim — don't substitute production creds

---

| Issue | Duration | Root Cause |
|-------|----------|------------|
| Homepage carousels blank | ~8 hours | Multiple issues (column casing, Footer, Promise.all, motion opacity) |
| Vercel deployment failures | ~2 hours | Root directory misconfiguration |
| Hardcoded data migration | ~6 hours | No database integration |
| Supabase free tier limits | ~1 hour | Direct browser queries |
| Hotel images not loading | ~2 hours | Frontend not consuming API `picture` field |
| Demo login broken | ~2 hours | Phase 1: Supabase Auth used instead of direct DB lookup; Phase 2: Anon key used as service key (RLS blocked); Phase 3: Service key JWT signature stale |
| TBO Hotel API auth mismatch | ~3 hours | Wrong auth method (TokenId vs Basic), wrong creds (shared flight vs dedicated hotel), wrong username |
| **Total** | **~24 hours** | |

---

## Key Takeaways

1. **Always check Vercel build logs first** — They show exact errors
2. **Verify DB column names match API queries** — PostgreSQL case sensitivity matters
3. **Use .catch() on all fetch calls** — Prevents silent failures
4. **Server components inside client components = client rendering** — Next.js gotcha
5. **Never query Supabase directly from browser** — Use API routes as proxy
6. **Test SSR output** — Check if content renders in initial HTML
7. **Set initial={{ opacity: 1 }} for SSR content** — Prevents invisible content
8. **Monorepo needs explicit root directory** — Vercel can't auto-detect
9. **Generate Context Brief before debugging** — Saves time by clarifying the problem
10. **Follow governance protocol** — Read Sprint-1.md, LEARNING-FROM-MISTAKES.md, CONFIG-REFERENCE.md first
11. **JWT signatures can go stale independently of the payload** — If "Invalid API key" appears, the JWT secret may have been rotated; get a fresh key from the Supabase dashboard
12. **Test Supabase keys locally before deploying** — `createClient(url, key).from('User').select()` instantly reveals invalid keys vs. RLS issues
13. **Never assume auth method** — Different API endpoints from the same provider can use completely different auth schemes (TokenId vs Basic Auth)
14. **Check domain ownership** — Flight (`api.tektravels.com`) and hotel (`api.tbotechnology.in`) run on different domains with different auth
15. **Verify credentials with support** — Don't guess usernames; get the exact string from the provider
16. **Read API docs before coding** — Saves hours of guessing auth patterns
17. **Use separate env vars for separate APIs** — Don't overload one set of vars for two providers (`TBO_HOTEL_*` vs `TBO_*`)
18. **Test each endpoint with curl first** — Isolates auth issues from integration issues
19. **Test credentials mean no balance** — "Insufficient Balance" on PreBook is expected for test creds; not a bug
