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

## Issue #6: Demo Login Fails — Supabase Auth + Wrong Fallback Emails

**Date:** June 11, 2026
**Duration:** ~1 hour
**Severity:** Medium — blocks quick access to the app

### Symptoms
- Clicking demo user buttons in login modal showed "Invalid login credentials"
- After fixing Supabase Auth fallback, showed "Failed to create user"
- Demo login buttons showed wrong email addresses

### Root Cause Analysis
1. **Supabase Auth has no demo users** — `signInWithEmail` tried `supabase.auth.signInWithPassword` first with all demo users, but no Supabase Auth user exists for demo accounts (they're only in the `User` DB table)
2. **Wrong fallback emails** — Hardcoded `DEMO_FALLBACK` had `@gorasa.com` emails, but actual DB users use `@gorasa.in` and `@example.com`
3. **Anon key used as service key** — Three API routes (`/api/auth/login`, `/api/auth/me`, `/api/users/demo`) used `NEXT_PUBLIC_SUPABASE_ANON_KEY` for server-side queries, preventing row-level access to the `User` table

### Resolution
1. **Added `signInDemo()` to `useAuth.tsx`** — Direct API call with just `{email}`, no Supabase Auth attempt, no password needed
2. **Fixed `DEMO_FALLBACK` emails** — Changed to match actual DB users (`hmittal@gorasa.in`, `admin@gorasa.in`, `sales@gorasa.in`, `neha@corp.in`, `amit@example.com`, `priya@example.com`)
3. **Switched to `SUPABASE_SERVICE_ROLE_KEY`** — All three API routes now use the service role key for DB queries

### Lessons Learned
1. **Don't mix Auth flow with simple DB lookup** — Demo users should skip Supabase Auth entirely
2. **Fallback data must match production** — Hardcoded demo emails that don't match the database cause confusing failures
3. **Environment variables need verification** — Both dev and production (`VERCEL_ENV`) env vars must be checked

### Prevention Measures
1. Demo login should always use a dedicated path (no Supabase Auth, no password)
2. Fallback/seed data should match actual DB records or be auto-generated from the same source
3. Verify `SUPABASE_SERVICE_ROLE_KEY` is set in both `.env.local` and Vercel project settings

---

| Issue | Duration | Root Cause |
|-------|----------|------------|
| Homepage carousels blank | ~8 hours | Multiple issues (column casing, Footer, Promise.all, motion opacity) |
| Vercel deployment failures | ~2 hours | Root directory misconfiguration |
| Hardcoded data migration | ~6 hours | No database integration |
| Supabase free tier limits | ~1 hour | Direct browser queries |
| Hotel images not loading | ~2 hours | Frontend not consuming API `picture` field |
| Demo login broken | ~1 hour | `signInWithEmail` tried Supabase Auth (no Auth user exists); hardcoded fallback emails didn't match DB; `NEXT_PUBLIC_SUPABASE_ANON_KEY` used as service key |
| **Total** | **~20 hours** | |

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
