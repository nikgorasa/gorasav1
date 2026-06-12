# Deployment Log

> Single source of truth for all production deployments. Every push to `main` must be logged here.

---

## Baseline Snapshot (2026-06-12)

| Field | Value |
|-------|-------|
| **Production URL** | https://gorasa-next.vercel.app |
| **Development URL** | https://project-uul0v.vercel.app |
| **QA URL** | https://project-sm6gc.vercel.app |
| **Vercel Project (Prod)** | gorasa-next (prj_WLoI80KaCmVZSudP17ohcPbzTpSe) |
| **Vercel Project (Dev)** | dev-gorasa (prj_BWE4hfy72DwYF39XamAwGYi3qg63) |
| **Vercel Project (QA)** | qa-gorasa (prj_j2eXtGEfgMZqUeTxlMjE0TCyyBwN) |
| **Root Directory** | gorasa-next/ (all projects) |
| **GitHub Repo** | nikgorasa/gorasav1 |
| **Deploy Remote** | neworigin → main (prod), dev, qa |
| **Supabase** | isubgeemvhvhnhikxbjb (RLS: ENABLED on 30+ tables) |
| **NEON Dev** | gorasa-dev (29 tables, 210 rows) |
| **NEON QA** | gorasa-qa (28 tables, 210 rows) |
| **Latest Commit** | 4d5367b (admin CRUD + users API fix) |
| **Auto-Deploy Status** | ✅ WORKING — All 3 environments active |

---

## Deployment History

| Date | Commit | SHA | Project | Status | URL | Notes |
|------|--------|-----|---------|--------|-----|-------|
| 2026-06-12 | Fix Vercel deploy path | 80f9033 | dev-gorasa, qa-gorasa | ✅ Ready | project-uul0v, project-sm6gc | Run vercel from repo root, not subdirectory |
| 2026-06-12 | User-facing ticket creation on support page | 2e513a7 | gorasa-next | ✅ Pushed | gorasa-next.vercel.app | /support page: AI Chat + My Tabs tabs, ticket create form, user ticket list |
| 2026-06-12 | Admin navigation full CRUD + Users API fix | 9b88eae,4d5367b | gorasa-next | ✅ Pushed | gorasa-next.vercel.app | Full CRUD on all 12 admin pages, service role key for Users API, user creation |
| 2026-06-12 | Ticket system + AI planner + governance | b742e8d | gorasa-next | ✅ Pushed | gorasa-next.vercel.app | 45 files, tickets tables, /holidays AI planner, 15 compulsory checks |
| 2026-06-12 | Staging env setup complete | 4b38848 | dev-gorasa, qa-gorasa | ✅ Ready | project-uul0v, project-sm6gc | NEON databases, env vars, GitHub secrets |
| 2026-06-12 | Remove hardcoded credentials | d89d75a | All | ✅ Ready | all | Security fix: remove PostgreSQL URIs from scripts |
| 2026-06-12 | Governance protocol update (operational modes) | df00f6a | gorasa-next | ✅ Ready | gorasa-next-... | Added plan/build modes to AGENTS.md |
| 2026-06-12 | Fallback hotel names fix | b45ab07 | gorasa-next | ✅ Ready | gorasa-next-... | Fixed "Hotel in Unknown" → "Hotel in Ayodhya" |
| 2026-06-12 | Fallback status check | c49dce2 | gorasa-next | ✅ Ready | gorasa-next-... | Check Status.Description for fallback |
| 2026-06-12 | Fallback hotels feature | d073d38 | gorasa-next | ✅ Ready | gorasa-next-... | Generic hotels for cities without TBO inventory |
| 2026-06-11 | Searchable city dropdown (cmdk + TBO) | 70146ef | gorasa-next | ✅ Ready | gorasa-next-... | 1083 cities from TBO API |
| 2026-06-11 | Hotel frontend fix (tbo-hotels endpoint) | 485a340 | gorasa-next | ✅ Ready | gorasa-next-... | Frontend now calls /api/tbo-hotels |
| 2026-06-11 | Flight route fix (use flight client) | e54df33 | gorasa-next | ✅ Ready | gorasa-next-69hlbolmw... | /api/tbo now uses flight client |
| 2026-06-11 | Hotel param extraction fix | a6918ff | gorasa-next | ✅ Ready | gorasa-next-69hlbolmw... | Extract from body.params |
| 2026-06-11 | Hotel search with real API | 7e7a93d | gorasa-next | ✅ Ready | gorasa-next-nsfkj97e4... | Resolve hotel codes from city |
| 2026-06-11 | TBO hotel env vars | fe561cc | gorasa-next | ✅ Ready | gorasa-next-giz13gkxa... | Added TBO_HOTEL_USERNAME/PASSWORD |
| 2026-06-11 | TBO hotel API integration | 6d0bfe6 | gorasa-next | ✅ Ready | gorasa-next-b764x16qm... | Basic Auth, separate creds |
| 2026-06-11 | Hotel images fix + Hotel REST API | cb1628b | gorasa-next | ✅ Ready | gorasa-next-qj2gil2l5... | Auto-deploy working, includes hotel images |
| 2026-06-11 | Hotel REST API rewrite | 53f7720 | gorasa-next | ✅ Ready | gorasa-next-qj2gil2l5... | Included in cb1628b deployment |
| 2026-06-11 | RLS Security Fix | (supabase migration) | Supabase | ✅ Applied | — | 27 tables, 5 policy groups |
| 2026-06-11 | Manual deploy test | (manual) | rasa-zero-app-main | ✅ Ready | rasa-zero-app-main-5co7wtph1... | Wrong project (repo root) |
| 2026-06-11 | Hotel images fix + Demo login fix | 130bafd | gorasa-next | ✅ Ready | gorasa-next-2j9fvet4h... | Service role key switch + signInDemo() |
| 2026-06-11 | Stale JWT fix (service key) | 28eb748 | gorasa-next | ✅ Ready | gorasa-next-3xbvwpts1... | Got correct service key from Supabase dashboard |
| 2026-06-11 | Last successful auto-deploy | (unknown) | gorasa-next | ✅ Ready | gorasa-next-asz7wttee... | Before recent commits |

---

## ADR References

- [ADR-20260611-001](docs/adr/ADR-20260611-001-rls-security.md) — RLS Security Fix
- [ADR-20260611-002](docs/adr/ADR-20260611-002-hotel-rest-api.md) — Hotel REST API Rewrite
- [ADR-20260611-003](docs/adr/ADR-20260611-003-vercel-autodeploy.md) — Vercel Auto-Deploy Fix (Resolved: Working)

---

## Rollback Log

| Date | Trigger | Action | ADR Reference | Result |
|-------|---------|--------|---------------|--------|
| — | — | — | — | — |

---

## Auto-Deploy Verification Checklist

### Production (gorasa-next)
- [x] Vercel dashboard: Connected Repository = `nikgorasa/gorasav1`
- [x] Vercel dashboard: Root Directory = `gorasa-next/`
- [x] Vercel dashboard: Auto-deploy = Enabled
- [x] Test commit triggers deployment
- [x] Deployment status = `Ready`
- [x] Production URL serves latest commit (verified: hotel images load)

### Development (dev-gorasa)
- [x] Vercel project created: `dev-gorasa` (prj_BWE4hfy72DwYF39XamAwGYi3qg63)
- [x] Root Directory = `gorasa-next/`
- [x] Environment variables configured (10 vars)
- [x] GitHub Actions workflow created (deploy-dev.yml)
- [x] GitHub environment secrets configured (13 secrets)
- [x] NEON database created (gorasa-dev, 29 tables, 210 rows)
- [x] Push to `dev` branch triggers deployment
- [x] Deployment status = `Ready`
- [x] Dev URL serves content (HTTP 200)

### QA (qa-gorasa)
- [x] Vercel project created: `qa-gorasa` (prj_j2eXtGEfgMZqUeTxlMjE0TCyyBwN)
- [x] Root Directory = `gorasa-next/`
- [x] Environment variables configured (10 vars)
- [x] GitHub Actions workflow created (deploy-qa.yml)
- [x] GitHub environment secrets configured (13 secrets)
- [x] NEON database created (gorasa-qa, 28 tables, 210 rows)
- [x] Push to `qa` branch triggers deployment
- [x] Deployment status = `Ready`
- [x] QA URL serves content (HTTP 200)

---

## Log Format

All future entries must follow:

```markdown
| YYYY-MM-DD | <description> | <sha> | <project> | <status> | <url> | ADR-XXXXXX |
```
## 2026-06-11

### Commit: bf83e0c12f550a57d4384a688143f0380305a8d6

Project: GoRASA
Status: Ready
ADR reference: N/A

---


## 2026-06-12

### Commit: ca00e227ced5a749a38837d4112c37ed08a08a0c

Project: GoRASA
Status: Ready
ADR reference: N/A

---


## 2026-06-12

### Commit: 586e9457e4cc24a3057679267e2df06a4547f4c9

Project: GoRASA
Status: Ready
ADR reference: N/A

---


## 2026-06-12

### Commit: 702db0cf683dc067b1810768606b4c0453bce8fd

Project: GoRASA
Status: Ready
ADR reference: N/A

---

## 2026-06-12

### Staging Environment Setup

**Summary:** Created Dev and QA staging environments with separate NEON databases.

| Environment | Vercel Project | Branch | Database | Status |
|-------------|---------------|--------|----------|--------|
| Production | gorasa-next | main | Supabase | ✅ Active |
| Development | dev-gorasa | dev | NEON gorasa-dev | ✅ Setup Complete |
| QA | qa-gorasa | qa | NEON gorasa-qa | ✅ Setup Complete |

**Data Migration:** 210 rows copied from Supabase to both NEON databases.

**Remaining Steps:**
1. Set Root Directory to `gorasa-next` for both Vercel projects
2. Set Production Branch to `dev` for dev-gorasa
3. Set Production Branch to `qa` for qa-gorasa
4. Add environment variables for qa-gorasa (same as dev-gorasa but with NEON QA URLs)
5. Deploy and verify

---


## 2026-06-12

### Commit: df00f6aad4baf25a8d1d33df848e7fa9173e2f05

Project: GoRASA
Status: Ready
ADR reference: N/A

---


## 2026-06-12

### Commit: 80f90337305dc5d21f112b58c077b30dae2fbc4b

Project: GoRASA
Status: Ready
ADR reference: N/A

---

