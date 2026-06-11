# GoRASA Project Memory

> **Purpose:** Persistent cross-session context. Updated at the end of every significant work session.
> **Last updated:** 2026-06-11

---

## Current Sprint Context

**Sprint:** Sprint -1 — Full Stack Migration & Foundation (June 8–12)
**Status:** Phase 5 completed. Demo login fixed.
**Live URL:** https://gorasa-next.vercel.app

---

## Active Goals

1. Fix demo login to look up existing DB users directly (no password, no Supabase Auth) — **DONE**
2. Internal beta readiness

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

---

## TBO API Status

| Endpoint | Status | Notes |
|----------|--------|-------|
| Flight search (mock) | ✅ Working | 11 flights, mock data |
| Hotel search (mock) | ✅ Working | 19 hotels, mock data |
| Real TBO flight API | ❌ Auth fails | Credentials return Status=3 |
| Real TBO hotel API | ❌ Auth fails | Credentials return Status=3 |
