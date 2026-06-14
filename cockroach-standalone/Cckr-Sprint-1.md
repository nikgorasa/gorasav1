# Sprint 1 — CockroachDB Standalone Setup

> **Goal:** Migrate gorasa-next from Supabase to CockroachDB on a standalone repo + Vercel project.
> **Timeline:** June 15, 2026

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Done |
| 🔄 | In Progress |
| 📋 | Planned |
| ⏳ | Blocked |

---

## Tasks

### Phase 1: Database Migration ✅

| Task | Status | Notes |
|------|--------|-------|
| Export all tables from Supabase | ✅ | 31 tables, 249 rows |
| Import to CockroachDB cluster | ✅ | aqua-pony-27730 |
| Drop FK constraints before import | ✅ | All 14 dropped |
| Re-add FK constraints after import | ✅ | All 14 restored |
| Verify row counts match | ✅ | Exact match |

### Phase 2: Code Migration ✅

| Task | Status | Notes |
|------|--------|-------|
| Rewrite 9 files to use Prisma directly | ✅ | No more `createClient` from `@supabase/supabase-js` |
| TypeScript compiles cleanly | ✅ | `npx tsc --noEmit` passes |
| Remove dual-mode code | ✅ | No `DATABASE_PROVIDER` switch |

### Phase 3: Vercel Setup ✅

| Task | Status | Notes |
|------|--------|-------|
| Create new Vercel project | ✅ | project-10o7w |
| Set environment variables | ✅ | 10+ env vars configured |
| Deploy to Vercel | ✅ | Homepage 200, API endpoints working |

### Phase 4: GitHub Setup ✅

| Task | Status | Notes |
|------|--------|-------|
| Create new repo | ✅ | Gorasa-In-2026/Gorasa-Cockroach |
| Add git remote | ✅ | origin → new repo, old-pipeline → old repo |
| Push code to main | ✅ | Current codebase on main |

### Phase 5: Governance 🔄

| Task | Status | Notes |
|------|--------|-------|
| Create GOVERNANCE.md | ✅ | Parallel protocol for CRDB standalone |
| Create MEMORY.md | ✅ | Session memory |
| Create CHANGE-LOG.md | ✅ | Change tracking |
| Create CONFIG-REFERENCE.md | ✅ | Configuration source of truth |
| Create LEARNING-FROM-MISTAKES.md | ✅ | Issue tracking |
| Create DEPLOYMENT_LOG.md | ✅ | Deployment history |
| Create Sprint-1.md | 🔄 | This document |
| Create DB-CHANGES.md | ✅ | DB change tracking |
| Create preflight/post-task scripts | ✅ | Parallel check scripts |
| Create docs/adr/ directory | ✅ | ADR location |

### Phase 6: Verification 📋

| Task | Status | Notes |
|------|--------|-------|
| Link Vercel to Gorasa-Cockroach repo | 📋 | Auto-deploy off |
| Push governance files to repo | 📋 | All committed and pushed |
| Verify all API endpoints | 📋 | Smoke test |

---

## Key Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Pipeline | Standalone, separate from DEV/QA/PROD | Keep existing pipeline untouched |
| Deploy | Manual push to main (no auto-deploy) | User controls when to deploy |
| DB | CockroachDB Basic (free tier) | 50M RUs/mo, 10 GiB — sufficient |
| Auth | Supabase (unchanged) | Independent from DB, no migration needed |
| Git merge | Manual cherry-picks from dev/qa | No automated sync between repos |
| Governance | Parallel `cockroach-standalone/` directory | Beside the code, not inside it |
