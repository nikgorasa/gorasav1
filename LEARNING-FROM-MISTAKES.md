# Learning from Mistakes — GoRASA Development Log

> **Purpose:** Document every significant issue encountered, root cause analysis, resolution steps, and lessons learned to prevent recurrence.

> **Last updated:** June 12, 2026

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

## Issue #8: Fallback Hotel Names Show "Unknown" Instead of City Name

**Date:** June 12, 2026
**Duration:** ~2 hours
**Severity:** Medium — fallback hotels displayed "Hotel in Unknown" instead of "Hotel in Ayodhya"

### Symptoms
- Cities without TBO inventory (like Ayodhya) returned fallback hotels
- Hotel names showed "Hotel in Unknown" instead of "Hotel in Ayodhya"
- Debug log confirmed `params.city: Ayodhya` was correct
- But output showed "Unknown" as city name

### Root Cause
- `getHotelInfoByCode()` function was hardcoded to call `generateFallbackHotels("Unknown")`
- The function didn't know the actual city name from the search request
- So it always generated fallback hotels with "Unknown" as the city

### Resolution Steps
1. Added debug logging to trace `params.city` value — confirmed it was "Ayodhya"
2. Traced code flow: `searchHotels()` → `mockSearchHotels()` → `getHotelInfoByCode()`
3. Found `getHotelInfoByCode()` line 676: `generateFallbackHotels("Unknown")` — hardcoded!
4. Fixed by using `fallbackHotels` array directly instead of calling `getHotelInfoByCode()`
5. Removed debug logging after fix confirmed

### Lessons Learned
1. **Don't pass data through multiple layers if you can use it directly** — `fallbackHotels` already had the correct city name
2. **Debug logging is essential** — without it, would have spent hours guessing
3. **Check hardcoded values first** — "Unknown" was a dead giveaway
4. **Test with cities that trigger fallback paths** — Goa works (mock data), Ayodhya triggers fallback

### Prevention Measures
1. Always pass context (like city name) through function parameters
2. Avoid hardcoded fallback values in utility functions
3. Test with multiple cities including ones without inventory
4. Use debug logging to trace data flow through multiple layers

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
| Hotel search param extraction | ~30 min | Route extracted from `body` root, not `body.params`; field names differed (CityName vs city) |
| Fallback hotel names "Unknown" | ~2 hours | `getHotelInfoByCode()` hardcoded to `generateFallbackHotels("Unknown")` instead of using actual city name |
| GitHub Actions Vercel deploy path | ~30 min | `vercel deploy` from `gorasa-next/` subdirectory with `rootDirectory: gorasa-next` doubled the path to `gorasa-next/gorasa-next` |
| Hardcoded PostgreSQL URIs in scripts | ~15 min | GitGuardian detected NEON connection strings committed in `setup-github-secrets.sh` |
| **Total** | **~28 hours** | |

---

## Issue #9: Ticket System — Missing `await` + UUID Format + RLS

**Date:** June 12, 2026
**Duration:** ~2 hours
**Severity:** High — ticket API returned empty `{}` on all operations

### Symptoms
- `GET /api/tickets` returned `{}` instead of ticket array
- `POST /api/tickets` returned `{}` instead of created ticket
- Supabase logs showed `401` (Invalid API key) and `400` (Bad Request) on tickets endpoints
- Direct Supabase client test worked fine — data was in the database

### Root Cause (4 layers)

1. **Missing `await`** — All 3 ticket API routes called async serverManager functions without `await`. `NextResponse.json(getAllTickets())` passed a Promise object, which serialized as `{}`.

2. **Invalid UUID format** — `generateId()` returned `TKT-xxx` string but `id` column is UUID type. Supabase rejected with `400 Bad Request`.

3. **Column type mismatch** — `user_id` and `assigned_to` were UUID type referencing `auth.users`, but the app passes string user IDs from its own `User` table.

4. **RLS blocking inserts** — Anon key can't insert with RLS enabled and no auth session. Service role key was invalid (stale JWT).

### Resolution
1. Added `await` to all async calls in `tickets/route.ts`, `tickets/[id]/route.ts`, `tickets/[id]/notes/route.ts`
2. Changed `generateId()` to use `crypto.randomUUID()`
3. Changed `user_id` and `assigned_to` columns from UUID to TEXT, dropped FK constraints
4. Enabled RLS with permissive "Full access" policy (matches `Lead` table pattern)

### Lessons Learned
1. **ALWAYS `await` async functions in API routes** — Missing `await` silently returns a Promise object instead of data. The response looks "successful" (200/201) but contains `{}`.
2. **UUID columns reject non-UUID strings** — If the column is UUID type, you must insert valid UUIDs. Custom ID formats like `TKT-xxx` fail silently.
3. **Match column types to actual data** — If the app uses string IDs (not Supabase Auth UUIDs), the column should be TEXT, not UUID.
4. **Check Supabase logs for 400/401 errors** — The logs immediately showed the real errors (invalid key, bad format) while the API returned empty success responses.
5. **RLS policy patterns matter** — Other tables (Lead, Package) use permissive policies with the anon key. New tables should follow the same pattern.

### Prevention Measures
1. Add ESLint rule to warn on unawaited async calls in API routes
2. Test API routes with actual curl requests, not just TypeScript compilation
3. Check Supabase logs when API returns unexpected empty responses
4. Follow existing RLS policy patterns when creating new tables

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
20. **TBO hotel API requires HotelCodes** — City-based search doesn't work; must fetch hotel codes via TBOHotelCodeList first
21. **Frontend sends nested params** — `{ action: "search", params: { CityName, ... } }` — route must extract from `body.params`, not `body`
22. **Static data endpoints need POST** — CountryList uses GET, but CityList and TBOHotelCodeList need POST with JSON body
23. **HotelCode is string not number** — TBO API returns "1279415" as string, not 1279415 as number; update all types accordingly
24. **Don't pass data through multiple layers if you can use it directly** — `fallbackHotels` already had correct city name; `getHotelInfoByCode()` didn't
25. **Debug logging saves hours** — Added `console.log` to trace `params.city` value; found the issue immediately
26. **Check hardcoded values first** — "Unknown" in `generateFallbackHotels("Unknown")` was the smoking gun
27. **Test with cities that trigger fallback paths** — Goa works (mock), Ayodhya triggers fallback; test both
28. **Operational modes matter** — Plan mode (read-only) vs Build mode (read-write); always check system reminders
29. **Vercel rootDirectory doubles when deploying from subdirectory** — If project has `rootDirectory: gorasa-next` and you run `vercel deploy` from `gorasa-next/`, it tries `gorasa-next/gorasa-next`. Always deploy from repo root.
30. **Never commit database connection strings** — GitGuardian detects PostgreSQL URIs. Use environment variables and GitHub secrets instead.
31. **GitHub Actions needs `npm install` before `vercel deploy`** — The Vercel CLI needs node_modules to be installed first.
32. **Vercel API doesn't support setting production branch** — Must be set via dashboard UI, not programmatically.
33. **SSO protection enabled by default on Vercel team projects** — Disable via API: `{"ssoProtection":null}` for public staging environments.
34. **Vercel env vars can have stale Supabase keys even when `.env.local` has correct keys** — If a dev server component that relies on a different environment project's env vars has different or outdated values compared to the local `.env.local`, API routes that use `SUPABASE_SERVICE_ROLE_KEY` will fail silently (showing only a generic "Failed to fetch" error).
35. **Check Vercel project env vars via API when debugging staging deployment issues** — `GET /v10/projects/{projectId}/env` reveals exactly what values are set per environment. Use this to compare against `.env.local`.
36. **Vercel environment variables for staging projects are NOT synced from `.env.local`** — They must be set separately per project. The GitHub Actions workflow does NOT pass them; they must exist on the Vercel project directly.

---

## Issue #10: Staging Demo Users API Failure — Stale Supabase Project Ref in Vercel Env Vars

**Date:** June 12, 2026
**Duration:** ~30 min
**Severity:** Medium — staging demo login broken

### Symptoms
- `GET /api/users/demo` returned `{"error":"Failed to fetch demo users"}` on both dev and QA staging
- `GET /api/cities` and `GET /api/tickets` worked fine on staging
- Production demo users endpoint worked fine
- No build errors in GitHub Actions logs

### Root Cause
- The `.env.local` file had been updated at some point with a **different Supabase project** (`isubgeemvhvhnhikxbjb`)
- The Vercel project env vars for dev-gorasa and qa-gorasa still had Supabase keys from the **old project** (`isubgeemvhvhnikxhbjb`)
- The old service role key was rejected by the new Supabase instance with "Invalid API key"
- The error was caught by the API route's catch block and returned as generic "Failed to fetch demo users"
- `/api/cities` worked because it uses the anon key with RLS (both old and new might have same data)
- `/api/tickets` worked because it uses the anon key with permissive RLS policy

### Resolution
1. Identified the correct Supabase keys from `.env.local`
2. Deleted and re-created 3 Supabase env vars on both dev and QA Vercel projects via Vercel API
3. Re-deployed both environments
4. Verified demo users API returned 6 users on both staging environments

### Lessons Learned
1. **Vercel staging project env vars are NOT synced from `.env.local`** — They must be set independently per project
2. **Stale Supabase keys cause silent failures** — The API returns a generic error, not "Invalid API key"
3. **Some endpoints may work while others fail** — Routes using anon key (cities, tickets) may work while service role key routes (demo users) fail
4. **Always verify with a key-checking test** — `createClient(url, key).from('User').select()` locally validates the keys
5. **The old and new Supabase URLs may look nearly identical** — `isubgeemvhvhnikxhbjb` vs `isubgeemvhvhnhikxbjb` differ by two characters — easy to miss

### Prevention Measures
1. When `.env.local` changes, update all Vercel project env vars immediately
2. Add a health check endpoint that verifies Supabase keys are valid
3. Compare Vercel project env vars against `.env.local` during staging deployment validation
4. Test both anon-key and service-role-key API routes after env var changes

---

## Issue #11: Post-Task Docs Not Fully Updated (Governance Gap)

**Date:** June 12, 2026
**Duration:** ~5 min (caught by user review, not by automation)
**Severity:** Medium — documentation drift

### Symptoms
- User asked to "run post flight check"
- Post-task script passed 15/15
- But CONFIG-REFERENCE.md still had old repo URL (`nikgorasa/gorasav1` → should be `Gorasa-In-2026/gorasav1`)
- DEPLOYMENT_LOG.md also had the stale repo URL
- Deploy instructions still referenced Vercel auto-deploy (was disconnected this session)

### Root Cause
The `post-task-check.sh` only verifies that files **exist** and CHANGE-LOG.md/MEMORY.md have **today's date** — it does NOT validate that the actual **content** of CONFIG-REFERENCE.md, DEPLOYMENT_LOG.md, or other docs is accurate for the work done.

In this session:
- The `post-task.md` said "7 targets" but in practice I only updated 2 (CHANGE-LOG + MEMORY)
- The governance rule auto-detects config changes (`CONFIG-REFERENCE.md (if keys/config changed - auto-detected)`) but there's no mechanism that runs the detection
- Repo URL change + deploy pipeline change are config changes that should have triggered CONFIG-REFERENCE.md update
- Branch protection + approval gate are deploy pipeline changes that should have triggered DEPLOYMENT_LOG.md update

### Resolution Steps
1. Updated CONFIG-REFERENCE.md: repo URL, deploy targets, branch protection table, approval gate section
2. Updated DEPLOYMENT_LOG.md: repo URL, baseline snapshot fix, added entry for 1a4de24
3. Re-ran post-task check → 15/15 passes

### Lessons Learned
1. **"Passes CI" ≠ "fully documented"** — The post-task script checks file existence + date, not content accuracy
2. **Config changes are easy to miss** — A repo URL change is "just a remote update" but it's a config change that must be reflected in the docs
3. **Manual review is the only safety net today** — The post-task script cannot detect which docs need content updates

### Prevention Measures
1. When updating git remotes, always check CONFIG-REFERENCE.md Section 11 (Git Setup) + Section 3 (Deploy Pipeline)
2. When changing deployment workflows, always update:
   - CONFIG-REFERENCE.md Sections 3, 23 (deploy instructions)
   - DEPLOYMENT_LOG.md baseline + add entry
3. Add a `post-task-content-check.sh` that greps CONFIG-REFERENCE.md and DEPLOYMENT_LOG.md for stale patterns (e.g., `nikgorasa/gorasav1`, `auto-deploy`, `git push main` → Vercel) and warns
4. **Self-review rule:** Before declaring work done, explicitly check each of the 7 doc targets against what actually changed — not just whether the file exists
