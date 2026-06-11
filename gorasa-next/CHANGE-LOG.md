# GoRASA Change Log

> **Purpose:** Chronological record of all significant code changes, with file paths and commit SHAs.
> **Format:** `YYYY-MM-DD | <description> | <files> | <commit-sha>`

---

## 2026-06-11 — Demo Login Fix + Stale JWT Key

### Problem
Demo login was completely broken:
1. `signInWithEmail` tried Supabase Auth (`signInWithPassword`) — no Auth user exists for demo accounts
2. `DEMO_FALLBACK` emails used wrong domain (`@gorasa.com` instead of `@gorasa.in`)
3. 3 API routes used anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) — RLS blocked User table access with 42501
4. After switching to service key, the JWT in Vercel env had a stale signature — Supabase rejected with "Invalid API key"

### Changes

| # | File | Change | Purpose |
|---|------|--------|---------|
| 1 | `gorasa-next/src/hooks/useAuth.tsx` | Added `signInDemo(email)` function | Direct API call with just `{email}`, no password, no Supabase Auth |
| 2 | `gorasa-next/src/components/LoginModal.tsx` | `handleDemoLogin` calls `signInDemo` instead of `signInWithEmail` | Bypass Supabase Auth for demo users |
| 3 | `gorasa-next/src/components/LoginModal.tsx` | Fixed `DEMO_FALLBACK` emails | Changed `@gorasa.com` → `@gorasa.in` and `hmittal@corp.in` → `hmittal@gorasa.in` |
| 4 | `gorasa-next/src/app/api/auth/login/route.ts` | Switched from `NEXT_PUBLIC_SUPABASE_ANON_KEY` → `SUPABASE_SERVICE_ROLE_KEY` | Bypass RLS on User table |
| 5 | `gorasa-next/src/app/api/auth/me/route.ts` | Same key switch | Bypass RLS on User table |
| 6 | `gorasa-next/src/app/api/users/demo/route.ts` | Same key switch | Bypass RLS on User table |
| 7 | Vercel env (production) | Updated `SUPABASE_SERVICE_ROLE_KEY` value | Old value had stale JWT signature; used dashboard key instead |

### Cause of Phase 1 Failure (42501)
3 API routes used `supabase` (anon key client) for server-side DB queries. RLS blocked all access to the `User` table for anonymous requests.

### Cause of Phase 2 Failure ("Invalid API key")
After switching to service key, the `SUPABASE_SERVICE_ROLE_KEY` env var in Vercel had a JWT signature that did not match the project's JWT secret — likely rotated since the key was first set 4 days ago.

### Verification
- `curl https://gorasa-next.vercel.app/api/users/demo` → returns all 6 users ✅
- `curl -X POST https://gorasa-next.vercel.app/api/auth/login -d '{"email":"hmittal@gorasa.in"}'` → returns full user object ✅

---

## 2026-06-11 — Hotel Images Not Loading

### Problem
Hotel search results showed blank images. The frontend was getting `picture=""` from API response.

### Root Cause
Commit `53f7720` (Hotel REST API rewrite) changed route param extraction from `body.params.*` to destructuring from `body` root. Frontend sends params nested under `body.params`, so `cityName` was always `undefined`.

### Changes

| # | File | Change |
|---|------|--------|
| 1 | `gorasa-next/src/app/api/tbo/route.ts` | Fixed param extraction: `body.params.CityName`, `body.params.CheckInDate`, etc. |
| 2 | `gorasa-next/src/lib/tbo-hotel-mock.ts` | Added `getHotelInfoByCode()` — searches all cities for hotel info by code |
| 3 | `gorasa-next/src/lib/tbo-hotel-client.ts` | Removed `cityCodeMap` mock fallback; replaced with direct `getHotelInfoByCode` lookup |
