# GoRASA CockroachDB Standalone — Memory

> **Purpose:** Persistent cross-session context for the CockroachDB standalone deployment.
> **Last updated:** 2026-06-15 (afternoon)

---

## ⚠️ IMPORTANT — READ FIRST

**Before ANY work, read `../DEPLOY.md` and run the command guard:**
```bash
cat ../DEPLOY.md
bash ../scripts/command-guard.sh "your command here"
```

---

## Current Status

**Deployment:** CockroachDB cluster `aqua-pony-27730` fully migrated from Supabase.
**Live URL:** https://project-10o7w.vercel.app
**GitHub:** https://github.com/Gorasa-In-2026/Gorasa-Cockroach
**DB:** CockroachDB Basic — 50M RUs/mo, 10 GiB, 31 tables, 249 rows

---

## Active Goals
1. Governance docs for standalone deployment — **DONE** (11 files with Cckr prefix)
2. Link Vercel project to Gorasa-Cockroach repo — **PENDING**
3. Verify all API endpoints on CockroachDB deployment — **DONE**
4. Future merges from dev/qa pipeline as manual cherry-picks — **PENDING**

---

## Architectural Decisions

| Decision | Chosen Approach | Date |
|----------|----------------|------|
| Database | CockroachDB Basic (aqua-pony-27730) | 2026-06-15 |
| DB client | Prisma (no dual-mode, no DATABASE_PROVIDER) | 2026-06-15 |
| Auth | Supabase — kept as-is, not migrated | 2026-06-15 |
| Migration | Exported 31 tables (249 rows) from Supabase, imported to CockroachDB | 2026-06-15 |
| FK constraints | Dropped before import, re-added after | 2026-06-15 |
| Deploy | Manual push to main (no auto-deploy) | 2026-06-15 |
| Pipeline | Standalone — separate from DEV/QA/PROD pipeline | 2026-06-15 |
| Git merge | Future dev/qa changes manually cherry-picked | 2026-06-15 |

---

## Known Constraints

| Constraint | Detail |
|------------|--------|
| CockroachDB Basic free tier | 50M RUs/mo, 10 GiB storage — monitor usage |
| Supabase Auth not migrated | Auth still points to `isubgeemvhvhnhikxbjb` — independent from DB |
| Single branch | Only `main` — no dev/qa/staging |
| No auto-deploy | Push manually to Vercel |
| Old Vercel project untouched | `gorasa-next` still at https://gorasa-next.vercel.app |
| Old git remote preserved | Renamed to `old-pipeline` |

---

## Session History

### Session 2026-06-15 (morning) — CockroachDB Migration + Standalone Setup

**Duration:** ~4 hours
**Changes:**
1. Exported all 31 tables (249 rows) from Supabase
2. Imported to CockroachDB cluster `aqua-pony-27730` via Node.js migration script
3. Dropped all 14 FK constraints before import, re-added after
4. Rewrote 9 files to use Prisma instead of `@supabase/supabase-js`
5. Created new Vercel project `project-10o7w`
6. Set 10+ env vars on new Vercel project
7. Deployed — homepage 200, all API endpoints return CockroachDB data
8. Created `Gorasa-In-2026/Gorasa-Cockroach` repo
9. Set up git remote: `cockroach` → new repo, `origin` → old repo (later corrected: origin must stay on gorasav1)
10. Created `cockroach-standalone/` governance directory
11. Wrote parallel governance docs (GOVERNANCE, MEMORY, CHANGE-LOG, CONFIG-REFERENCE, etc.)

**Status:** Standalone deployment functional. Governance being established.

### Session 2026-06-15 (afternoon) — Governance Finalization + File Rename

**Duration:** ~1 hour
**Changes:**
1. Updated all 7 root governance docs with CockroachDB standalone context (MEMORY, CONFIG-REFERENCE, CHANGE-LOG, LEARNING-FROM-MISTAKES, DEPLOYMENT_LOG, DB-CHANGES, Sprint-1)
2. Confirmed local `.env.local` stays on Neon — only Vercel deploy overrides to CockroachDB
3. Renamed all 11 governance files with `Cckr` prefix
4. Updated all internal cross-references in Cckr-GOVERNANCE.md, Cckr-preflight-check.sh, Cckr-post-task-check.sh
5. Ran Cckr-post-task-check.sh — all 10 checks passed

**Status:** Governance complete. Dual-instance architecture implemented.

### Session 2026-06-15 (evening) — Dual-Instance Governance Architecture

**Duration:** ~30 min
**Changes:**
1. Documented dual-instance architecture in Cckr-GOVERNANCE.md — two governance instances (Main + Cckr) with conditional activation based on PWD
2. Created `scripts/detect-governance-root.sh` — shared detection script that resolves governance type, root, doc paths, and script paths from `$PWD`
3. Updated root `scripts/preflight-check.sh` and `scripts/post-task-check.sh` to source detection and auto-delegate to correct instance
4. Updated `cockroach-standalone/scripts/Cckr-preflight-check.sh` and `Cckr-post-task-check.sh` to source detection and print active instance
5. All scripts can be invoked from either root — detection handles routing

**Design:**
- Detection checks `$PWD` for `/cockroach-standalone/` substring
- If matched → Cckr protocol with `Cckr-*` docs, Cckr scripts
- If not matched → Main GoRASA protocol with plain-name docs, gorasa-next scripts
- Script is dual-mode: works as `source` (exports vars) or standalone (`--export` flag)

**Status:** Both governance instances coexist correctly. Conditional switching operational.

---

## Next Steps
1. Link Vercel project project-10o7w to Gorasa-Cockroach repo (auto-deploy off) — **BLOCKED: needs user action in Vercel dashboard**
2. Push governance files to Gorasa-Cockroach repo
3. Verify all API endpoints on deployed CockroachDB instance
4. Plan first cherry-pick from dev/qa branch
