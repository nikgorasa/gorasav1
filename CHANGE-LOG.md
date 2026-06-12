# GoRASA — Change Log

> **Purpose:** Record of all significant changes with commit SHAs.
> **Format:** `DATE | COMMIT | DESCRIPTION`

---

| Date | Commit | Description |
|------|--------|-------------|
| 2026-06-12 | 1a4de24 | ci: branch protection (main/qa) + Prod env approval gate + repo moved to org |
| 2026-06-12 | 2e513a7 | feat: add user-facing ticket creation and listing to support page |
| 2026-06-12 | (pending) | feat: ticket system productionization + AI planner integration |
| 2026-06-12 | 80f9033 | ci: fix Vercel deploy path in GitHub Actions |
| 2026-06-12 | 36e4e0c | ci: update GitHub Actions workflows for Vercel deployment |
| 2026-06-12 | 3e6470a | ci: add GitHub Actions workflows for dev/qa deployments |
| 2026-06-12 | d89d75a | security: remove hardcoded Supabase keys from codebase |
| 2026-06-12 | 4b38848 | chore: staging environment setup complete |
| 2026-06-12 | 45f8a49 | docs: update deployment log with staging setup |
| 2026-06-12 | abdd0e4 | chore: add NEON database creation helper script |
| 2026-06-12 | 4181188 | feat: add migration scripts and env templates for staging |
| 2026-06-12 | c89fbb1 | docs: add context brief for staging/qa environment setup |
| 2026-06-12 | (pending) | docs: add operational modes (plan/build) to governance protocol |
| 2026-06-11 | 530ac44 | feat: flights use IATA codes from Supabase City table via TBO API |
| 2026-06-11 | da14b48 | feat: dynamic city code resolution - remove hardcoded mapping dependency |
| 2026-06-11 | 4ae87e4 | feat: add 30+ Indian cities to hotel search (Ayodhya, Haridwar, Dehradun, etc.) |
| 2026-06-11 | 90c03f4 | docs: update CONFIG-REFERENCE.md with live TBO API status |
| 2026-06-11 | 70146ef | feat: searchable city dropdown with TBO live data (cmdk) |
| 2026-06-11 | 261e988 | fix: cache hotel names and ratings from TBOHotelCodeList API |
| 2026-06-11 | 8f4170f | feat: add 15+ Indian cities to hotel search (Kodaikanal, Ooty, Manali, etc.) |
| 2026-06-11 | 8fcab32 | fix: convert MM/DD/YYYY dates to YYYY-MM-DD for TBO API |
| 2026-06-11 | 485a340 | fix: hotel frontend calls /api/tbo-hotels instead of /api/tbo |
| 2026-06-11 | e54df33 | fix: /api/tbo route now uses flight client (not hotel) |
| 2026-06-11 | a6918ff | fix: extract hotel search params from body.params (frontend nested format) |
| 2026-06-11 | 7e7a93d | fix: TBO hotel search with real API - resolve hotel codes from city name |
| 2026-06-11 | fe561cc | chore: trigger redeploy with TBO hotel env vars |
| 2026-06-11 | 6d0bfe6 | feat: TBO hotel API live integration + governance fixes |
| 2026-06-11 | b45bba7 | Add MEMORY.md + CHANGE-LOG.md, update governance hooks and docs |
| 2026-06-11 | 28eb748 | fix: use correct SUPABASE_SERVICE_ROLE_KEY |
| 2026-06-11 | 130bafd | fix: update SUPABASE_SERVICE_ROLE_KEY in Vercel |
| 2026-06-11 | 07c492a | fix: replace dead hookify files with working opencode-yaml-hooks plugin |
| 2026-06-11 | a5cf522 | fix: demo login without password — skip Supabase Auth, match DB emails |
| 2026-06-11 | cb1628b | Hotel images fix + Hotel REST API |
| 2026-06-11 | 53f7720 | Hotel REST API rewrite |

## 2026-06-12 01:34:56 +0900

### Commit: 702db0c debug: log params.city in fallback path

Files changed:
gorasa-next/src/lib/tbo-hotel-client.ts

Description: Governance protocol implementation - GoRASA pre-flight and post-task scripts

---


## 2026-06-12 01:58:57 +0900

### Commit: 702db0c debug: log params.city in fallback path

Files changed:
gorasa-next/src/lib/tbo-hotel-client.ts

Description: Governance protocol implementation - GoRASA pre-flight and post-task scripts

---


## 2026-06-12 02:02:40 +0900

### Commit: 702db0c debug: log params.city in fallback path

Files changed:
gorasa-next/src/lib/tbo-hotel-client.ts

Description: Governance protocol implementation - GoRASA pre-flight and post-task scripts

---


## 2026-06-12 02:07:03 +0900

### Commit: 702db0c debug: log params.city in fallback path

Files changed:
gorasa-next/src/lib/tbo-hotel-client.ts

Description: Governance protocol implementation - GoRASA pre-flight and post-task scripts

---


## 2026-06-12 02:19:49 +0900

### Commit: 702db0c debug: log params.city in fallback path

Files changed:
gorasa-next/src/lib/tbo-hotel-client.ts

Description: Governance protocol implementation - GoRASA pre-flight and post-task scripts

---


## 2026-06-12 02:22:45 +0900

### Commit: 702db0c debug: log params.city in fallback path

Files changed:
gorasa-next/src/lib/tbo-hotel-client.ts

Description: Governance protocol implementation - GoRASA pre-flight and post-task scripts

---


## 2026-06-12 02:32:43 +0900

### Commit: df00f6a docs: add operational modes (plan/build) to governance protocol

Files changed:
CHANGE-LOG.md
gorasa-next/AGENTS.md

Description: Governance protocol implementation - GoRASA pre-flight and post-task scripts

---


## 2026-06-12 05:23:27 +0900

### Commit: 80f9033 ci: fix Vercel deploy path in GitHub Actions

Files changed:
.github/workflows/deploy-dev.yml
.github/workflows/deploy-qa.yml

Description: Governance protocol implementation - GoRASA pre-flight and post-task scripts

---

## 2026-06-12 06:20 IST

### feat: ticket system productionization + AI planner integration

Files changed:
gorasa-next/src/lib/ticket/serverManager.ts
gorasa-next/src/app/api/tickets/route.ts
gorasa-next/src/app/api/tickets/[id]/route.ts
gorasa-next/src/app/api/tickets/[id]/notes/route.ts
gorasa-next/src/app/payment/success/page.tsx
gorasa-next/src/app/holidays/page.tsx (copied from planner)

Database changes:
- Created tickets, ticket_notes, ticket_activities tables (Supabase migration)
- Changed user_id and assigned_to columns from UUID to TEXT
- Dropped FK constraints to auth.users
- Enabled RLS with permissive "Full access" policies (matches Lead table pattern)

Description:
1. Integrated AI Holiday Planner to /holidays route (copied from /planner)
2. Fixed ticket system: missing await on all async serverManager calls
3. Fixed ticket ID format: UUID instead of TKT-xxx string
4. Fixed column types: user_id/assigned_to UUID → TEXT (app uses string IDs)
5. Enabled RLS with permissive policies matching existing database pattern
6. Fixed payment/success Suspense boundary for useSearchParams
7. Verified all APIs: tickets GET/POST, support, intent classification, holiday planner

---


## 2026-06-12 — Admin Navigation Full CRUD

### Changes Made:

**New API Routes (4):**
- `api/corporate-rates/[id]/route.ts` — PATCH + DELETE for corporate rates
- `api/rewards/[id]/route.ts` — PATCH + DELETE for loyalty rewards
- `api/tickets/[id]/notes/route.ts` — GET + POST for admin ticket notes (uses serverManager)
- `api/leads/assignable-users/route.ts` — GET list of SALES/ADMIN users for lead assignment

**Modified API Routes (3):**
- `api/companies/route.ts` — Added POST for company creation + removed `isActive: true` filter for admin view
- `api/companies/[id]/route.ts` — Extended PATCH to support all fields (name, domain, discountRate, isActive) + added DELETE
- `api/rewards/route.ts` — Added POST for reward creation + `?all=true` param for admin view of all rewards

**Updated Frontend Pages (5):**
- `admin/corporate/page.tsx` — Company dropdown selector (replaces raw companyId input), inline edit, delete button
- `admin/b2b/page.tsx` — Create company form, inline edit on company cards, delete with confirmation
- `admin/loyalty/page.tsx` — Admin mode toggle, full CRUD for rewards (create/edit/delete/toggle active)
- `admin/tickets/page.tsx` — Priority dropdown, admin notes thread with add form, archive button (no delete per requirement)
- `admin/ai-leads/page.tsx` — Stage update buttons, assignment dropdown from assignable users API

**Verification:** TypeScript compiles cleanly (`npx tsc --noEmit`), Next.js build succeeds, all 15 post-task checks pass.

---

## 2026-06-12 — Staging Environments Go-Live

### Changes Made:

**Documentation Updates:**
- Updated CONFIG-REFERENCE.md, DEPLOYMENT_LOG.md, MEMORY.md, STAGING-README.md with real Vercel URLs

**Git Branch Sync:**
- Merged `main` into `dev` and `qa` (synced 8-commit gap)
- Cherry-picked URL commit to `dev` + `qa` branches
- Pushed all 3 branches to `neworigin`

**Deployment Fixes:**
- Renewed expired Vercel token (`vca_L7xKp5...` → `vca_7ajKdYhA...`)
- Updated VERCEL_TOKEN GitHub environment secrets

**Supabase Env Var Fix (Critical):**
- Discovered `.env.local` had been updated with a **different Supabase project** (`isubgeemvhvhnhikxbjb`)
- Vercel dev/QA project env vars still had old ref (`isubgeemvhvhnikxhbjb`) → demo users API returned "Failed to fetch demo users"
- Replaced NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY on both dev-gorasa and qa-gorasa Vercel projects via API
- Redeployed both environments — all endpoints now functional

**Verification:**
- Dev HTTP 200: home, cities (35), tickets (3), demo users (6)
- QA HTTP 200: home, cities (35), tickets (3), demo users (6)
