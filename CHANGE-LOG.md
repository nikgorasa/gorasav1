# GoRASA — Change Log

> **Purpose:** Record of all significant changes with commit SHAs.
> **Format:** `DATE | COMMIT | DESCRIPTION`

---

| Date | Commit | Description |
|------|--------|-------------|
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
