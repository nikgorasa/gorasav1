# Deployment Log

> Single source of truth for all production deployments. Every push to `main` must be logged here.

---

## Baseline Snapshot (2026-06-11)

| Field | Value |
|-------|-------|
| **Production URL** | https://gorasa-next.vercel.app |
| **Vercel Project** | gorasa-next (prj_WLoI80KaCmVZSudP17ohcPbzTpSe) |
| **Root Directory** | gorasa-next/ |
| **GitHub Repo** | nikgorasa/gorasav1 |
| **Deploy Remote** | neworigin → main |
| **Supabase** | isubgeemvhvhnhikxbjb (RLS: ENABLED on 27 tables) |
| **Latest Commit** | cb1628b (Hotel images fix) |
| **Auto-Deploy Status** | ✅ WORKING - Latest deployment 49 min ago includes latest commits |

---

## Deployment History

| Date | Commit | SHA | Project | Status | URL | Notes |
|------|--------|-----|---------|--------|-----|-------|
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

- [x] Vercel dashboard: Connected Repository = `nikgorasa/gorasav1`
- [x] Vercel dashboard: Root Directory = `gorasa-next/`
- [x] Vercel dashboard: Auto-deploy = Enabled
- [x] Test commit triggers deployment
- [x] Deployment status = `Ready`
- [x] Production URL serves latest commit (verified: hotel images load)

---

## Log Format

All future entries must follow:

```markdown
| YYYY-MM-DD | <description> | <sha> | <project> | <status> | <url> | ADR-XXXXXX |
```