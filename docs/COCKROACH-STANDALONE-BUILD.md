# Cockroach Standalone Build

> **Purpose:** Complete deployment manifest for production preparation.  
> **Any agent** (human or AI) can follow this document end-to-end.  
> **Last updated:** 2026-06-15

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      PRODUCTION (main)                      │
│  gorasa-next.vercel.app  ───  Supabase  ───  CockroachDB   │
│  DATABASE_PROVIDER=supabase                                 │
├─────────────────────────────────────────────────────────────┤
│                    DEVELOPMENT (dev)                         │
│  dev-gorasa.vercel.app  ───  NEON (gorasa-dev)             │
│  DATABASE_PROVIDER=prisma                                   │
├─────────────────────────────────────────────────────────────┤
│                    QA / STAGING (qa)                         │
│  qa-gorasa.vercel.app  ───  NEON (gorasa-qa)               │
│  DATABASE_PROVIDER=prisma                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Git Branches & Remotes

| Remote   | URL                                                  | Branches              |
|----------|------------------------------------------------------|-----------------------|
| `origin` | `https://github.com/Gorasa-In-2026/gorasav1.git`     | `dev`, `qa`, `main`   |
| `cockroach` | `https://github.com/Gorasa-In-2026/Gorasa-Cockroach.git` | `main` (prod only) |

### Branch → Environment Mapping

| Branch | Vercel Project       | DB Provider | DB Target         | Deploy Trigger |
|--------|----------------------|-------------|-------------------|----------------|
| `dev`  | `dev-gorasa`         | `prisma`    | NEON gorasa-dev   | Push to `dev` |
| `qa`   | `qa-gorasa`          | `prisma`    | NEON gorasa-qa    | PR → `qa`     |
| `main` | `gorasa-next`        | `supabase`  | Supabase pooler   | Manual `workflow_dispatch` + approval |

### Current Commit State

Run `bash scripts/preflight-check.sh` to see live state, or read `docs/DEPLOYMENT-COMMIT-MAP.md`.

---

## 3. Vercel Projects

### 3.1 Project IDs

| Environment | Project Name     | Project ID                                    |
|-------------|------------------|-----------------------------------------------|
| Production  | `gorasa-next`    | `prj_WLoI80KaCmVZSudP17ohcPbzTpSe`           |
| Development | `dev-gorasa`     | `prj_BWE4hfy72DwYF39XamAwGYi3qg63`           |
| QA          | `qa-gorasa`      | `prj_j2eXtGEfgMZqUeTxlMjE0TCyyBwN`           |

**Team:** `nikhil-gorasa-s-projects` (ID: `team_0pR3Xnbjx12q8H8pZF9xgE5S`)

### 3.2 Required Env Vars (ALL environments)

These **must** exist on every Vercel project with non-empty values:

| Env Var                    | Type        | Source of Truth                            |
|----------------------------|-------------|--------------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | plain      | `https://isubgeemvhvhnhikxbjb.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | plain | Supabase dashboard → Settings → API        |
| `SUPABASE_SERVICE_ROLE_KEY` | encrypted | Supabase dashboard → Settings → API        |
| `TBO_USERNAME`             | encrypted   | `.env.local` or GitHub secrets             |
| `TBO_PASSWORD`             | encrypted   | `.env.local` or GitHub secrets             |
| `TBO_HOTEL_USERNAME`       | encrypted   | `.env.local` or GitHub secrets             |
| `TBO_HOTEL_PASSWORD`       | encrypted   | `.env.local` or GitHub secrets             |
| `TBO_ENDPOINT`             | encrypted   | `http://api.tbotechnology.in/hotelapi_v7/hotelservice.svc` |

### 3.3 Env Vars Per Environment

**Production (`gorasa-next`):**
| Env Var | Value |
|---------|-------|
| `DATABASE_PROVIDER` | `supabase` |
| `DATABASE_URL` | Supabase pooler connection string |
| `DIRECT_URL` | Supabase direct connection string |

**Development (`dev-gorasa`):**
| Env Var | Value |
|---------|-------|
| `DATABASE_PROVIDER` | `prisma` |
| `DATABASE_URL` | `postgresql://neondb_owner:<password>@<host>-pooler.<region>.aws.neon.tech/neondb?sslmode=require` |
| `DIRECT_URL` | `postgresql://neondb_owner:<password>@<host>.<region>.aws.neon.tech/neondb?sslmode=require` |

**QA (`qa-gorasa`):**
| Env Var | Value |
|---------|-------|
| `DATABASE_PROVIDER` | `prisma` |
| `DATABASE_URL` | `postgresql://neondb_owner:<password>@<host>-pooler.<region>.aws.neon.tech/neondb?sslmode=require` |
| `DIRECT_URL` | `postgresql://neondb_owner:<password>@<host>.<region>.aws.neon.tech/neondb?sslmode=require` |

### 3.4 Restoring Env Vars

If env vars are accidentally deleted (like the Mimo incident):

```bash
# 1. Read values from GitHub secrets (they persist)
gh secret list --repo Gorasa-In-2026/gorasav1 --env "Production – qa-gorasa"

# 2. Add them via Vercel API
VERCEL_TOKEN=$(python3 -c 'import json; print(json.load(open("/home/nikhil/.local/share/com.vercel.cli/auth.json"))["token"])')
curl -X POST "https://api.vercel.com/v10/projects/<PROJECT_ID>/env?..."
# See preflight-check.sh Check 17 for the full command pattern

# 3. Run pre-flight check to verify
bash scripts/preflight-check.sh
```

**After restoring, trigger a redeployment:**
```bash
gh workflow run deploy-qa.yml --ref qa
# Or via Vercel dashboard: Deployments → Redeploy
```

---

## 4. NEON Databases

| Environment | Project ID                   | Region    | Branch ID            | Connection String (Neon API) |
|-------------|------------------------------|-----------|----------------------|------------------------------|
| Dev         | `small-haze-12127097`        | us-east-1 | `br-restless-water-ai8fwpsm` | Get via: `neon get-connection-string --project-id small-haze-12127097` |
| QA          | `patient-violet-81222905`    | us-east-1 | `br-cold-smoke-adsxf47s` | Get via: `neon_get_connection_string` MCP tool |

**Organization:** `org-square-dawn-72979786` (Gorasa)

**Neon API Key:** `[REDACTED - get from Neon dashboard]`

### Password Rotation

If a Neon password is exposed:
```bash
# Rotate via Neon API
POST /projects/{projectId}/branches/{branchId}/roles/neondb_owner/reset_password
# Returns new npg_* password immediately
```

Then update:
1. `.env.local` — local development
2. Vercel env vars — `DATABASE_URL` and `DIRECT_URL`
3. GitHub secrets — `DATABASE_URL` and `DIRECT_URL` for CI/CD

---

## 5. Supabase

| Property | Value |
|----------|-------|
| Project Ref | `isubgeemvhvhnhikxbjb` |
| Region | ap-southeast-1 |
| Dashboard URL | `https://supabase.com/dashboard/project/isubgeemvhvhnhikxbjb` |
| DB Host (pooler) | `aws-0-ap-southeast-1.pooler.supabase.com:6543` |
| DB Host (direct) | `aws-0-ap-southeast-1.pooler.supabase.com:5432` |

**⚠ CRITICAL:** Supabase credentials exposed in git history:
- DB password: `Womanly@Deem6@Trivial`
- Service role key (JWT)

These **cannot be rotated via MCP** — must be done from Supabase dashboard.

---

## 6. GitHub Actions Workflows

| Workflow | File | Trigger | Deploys To |
|----------|------|---------|------------|
| Deploy to Dev | `.github/workflows/deploy-dev.yml` | Push to `dev` | `dev-gorasa` |
| Deploy to QA | `.github/workflows/deploy-qa.yml` | PR to `qa` | `qa-gorasa` |
| Deploy to Prod | `.github/workflows/deploy-prod.yml` | Manual `workflow_dispatch` | `gorasa-next` |

### GitHub Environment Secrets

Each environment has its own `Production – <project>` environment with secrets:

**Shared secrets (all environments):**
- `TBO_USERNAME`, `TBO_PASSWORD`, `TBO_HOTEL_USERNAME`, `TBO_HOTEL_PASSWORD`, `TBO_ENDPOINT`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `VERCEL_ORG_ID`, `VERCEL_TOKEN`

**Dev-specific:**
- `DATABASE_URL`, `DIRECT_URL`
- `VERCEL_DEV_PROJECT_ID`

**QA-specific:**
- `DATABASE_URL`, `DIRECT_URL`
- `VERCEL_QA_PROJECT_ID`

---

## 7. Governance Protocol

### Pre-Flight (18 checks)
```bash
bash scripts/preflight-check.sh
```
Checks: docs exist, last session context, known issues, config, env vars, TSC, git status, recent commits, critical files, hooks, branch→DB mapping, Supabase shield, Vercel cross-ref, secret scan, commit traceability, DB sync, **env var integrity** (Check 17), **cross-project sync** (Check 18).

### Post-Task (28 checks)
```bash
bash scripts/post-task-check.sh
```
All of the above + DB intent verification, schema sync, git guard, deployment commit map.

### Hooks (Auto-Enforcement)
- `file.changed` (code) → `npx tsc --noEmit`
- `session.idle` → `post-task-check.sh`

---

## 8. Security Status

| Item | Status | Action Needed |
|------|--------|---------------|
| Neon Dev password rotation | ✅ Done (rotated via API) | None |
| Neon QA password rotation | ✅ Done (rotated via API) | None |
| `.example` files masked | ✅ Done | None |
| `scripts/*.example` in `.gitignore` | ✅ Done | None |
| Pre/post-task secret scanning | ✅ Active (Check 14/24) | None |
| Vercel env var integrity check | ✅ Active (Check 17/27) | None |
| Cross-project sync check | ✅ Active (Check 18/28) | None |
| Supabase DB password exposed | ❌ In git history | Rotate via Supabase dashboard |
| Supabase service role key exposed | ❌ In git history | Rotate via Supabase dashboard |

---

## 9. Production Go-Live Checklist

- [ ] All 28 post-task checks pass
- [ ] Supabase credentials rotated (DB password + service role key)
- [ ] CockroachDB migration verified (9 Supabase files → Prisma)
- [ ] `DATABASE_PROVIDER` set to `cockroachdb` (or new value) on prod Vercel
- [ ] Prod `DATABASE_URL` / `DIRECT_URL` point to CockroachDB
- [ ] Schema pushed to CockroachDB: `npx prisma db push`
- [ ] Data migrated from Supabase to CockroachDB
- [ ] Stage deploy (QA → prod Vercel but pointing at CockroachDB staging)
- [ ] Full E2E test pass
- [ ] Swap DNS/production traffic
- [ ] Monitor: deploy logs, error rates, DB performance

---

## 10. Incident Response: Env Var Deletion

**If env vars are deleted from a Vercel project (like the Mimo incident on 2026-06-15):**

1. **Don't panic** — GitHub secrets still have all values
2. **Check damage:**
   ```bash
   VERCEL_TOKEN=... curl "https://api.vercel.com/v9/projects/<PROJECT_ID>/env?teamId=..."
   ```
3. **Restore from GitHub secrets:** Use the Vercel API to POST each missing var
4. **Verify:** Run `bash scripts/preflight-check.sh` (Check 17 will catch any still-missing vars)
5. **Redeploy:** `gh workflow run deploy-qa.yml --ref qa`
6. **Root cause:** The env var integrity checks (Check 17/27) now prevent silent deletion — they will **fail** if any required env var is missing or empty
