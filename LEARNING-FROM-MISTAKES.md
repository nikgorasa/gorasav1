# Learning from Mistakes — GoRASA Development Log

> **Purpose:** Document every significant issue encountered, root cause analysis, resolution steps, and lessons learned to prevent recurrence.

> **Last updated:** June 9, 2026

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

## Summary of Time Spent

| Issue | Duration | Root Cause |
|-------|----------|------------|
| Homepage carousels blank | ~8 hours | Multiple issues (column casing, Footer, Promise.all, motion opacity) |
| Vercel deployment failures | ~2 hours | Root directory misconfiguration |
| Hardcoded data migration | ~6 hours | No database integration |
| Supabase free tier limits | ~1 hour | Direct browser queries |
| **Total** | **~17 hours** | |

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
