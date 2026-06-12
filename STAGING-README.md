# GoRASA Staging Environment Setup

> **Date:** June 12, 2026  
> **Status:** ✅ Complete — All 3 environments active and verified  
> **Purpose:** Isolated Dev and QA environments for testing before production deployment

---

## Architecture

```
Production:  gorasa-next  → main branch → Supabase (isubgeemvhvhnhikxbjb)
Development: dev-gorasa   → dev branch  → NEON (gorasa-dev)
QA:          qa-gorasa    → qa branch   → NEON (gorasa-qa)
```

---

## Environment URLs

| Environment | URL | Database | Status |
|-------------|-----|----------|--------|
| Production | https://gorasa-next.vercel.app | Supabase | ✅ Active |
| Development | https://dev-gorasa-*.vercel.app | NEON gorasa-dev | ✅ Active |
| QA | https://qa-gorasa-*.vercel.app | NEON gorasa-qa | ✅ Active |

---

## Vercel Projects

| Project | ID | Branch | Root Dir | Build Command |
|---------|-----|--------|----------|---------------|
| gorasa-next | `prj_WLoI80KaCmVZSudP17ohcPbzTpSe` | main | gorasa-next/ | `npx prisma generate && npx next build` |
| dev-gorasa | `prj_BWE4hfy72DwYF39XamAwGYi3qg63` | dev | gorasa-next/ | `npx prisma generate && npx next build` |
| qa-gorasa | `prj_j2eXtGEfgMZqUeTxlMjE0TCyyBwN` | qa | gorasa-next/ | `npx prisma generate && npx next build` |

---

## NEON Databases

| Database | Host | Tables | Rows | Status |
|----------|------|--------|------|--------|
| gorasa-dev | ep-quiet-tooth-aiehj2mq.c-4.us-east-1.aws.neon.tech | 29 | 210 | ✅ Active |
| gorasa-qa | ep-quiet-tooth-aiehj2mq.c-4.us-east-1.aws.neon.tech | 28 | 210 | ✅ Active |

---

## GitHub Actions Workflows

| Workflow | File | Trigger | Environment |
|----------|------|---------|-------------|
| Deploy Dev | `.github/workflows/deploy-dev.yml` | push to `dev` | Production – dev-gorasa |
| Deploy QA | `.github/workflows/deploy-qa.yml` | push to `qa` | Production – qa-gorasa |

**Workflow steps:**
1. Checkout code
2. Setup Node.js 24
3. Install dependencies (`npm install` in gorasa-next/)
4. Install Vercel CLI
5. Deploy to Vercel (`vercel deploy --prod --yes`)

---

## GitHub Environment Secrets

Both `Production – dev-gorasa` and `Production – qa-gorasa` have 13 secrets:

| Secret | Purpose |
|--------|---------|
| `DATABASE_URL` | NEON pooled connection |
| `DIRECT_URL` | NEON direct connection |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `TBO_USERNAME` | TBO flight API login |
| `TBO_PASSWORD` | TBO flight API password |
| `TBO_HOTEL_USERNAME` | TBO hotel API login |
| `TBO_HOTEL_PASSWORD` | TBO hotel API password |
| `TBO_ENDPOINT` | TBO hotel API endpoint |
| `VERCEL_TOKEN` | Vercel deployment token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_DEV_PROJECT_ID` / `VERCEL_QA_PROJECT_ID` | Vercel project ID |

---

## How to Deploy

```bash
# Deploy to Development
git checkout dev
# make changes...
git push neworigin dev  →  GitHub Action → dev-gorasa.vercel.app

# Deploy to QA
git checkout qa
git merge dev
git push neworigin qa   →  GitHub Action → qa-gorasa.vercel.app

# Deploy to Production
git checkout main
git merge qa
git push neworigin main →  Vercel auto-deploy → gorasa-next.vercel.app
```

---

## Database Sync

When new tables are added to Supabase, sync to NEON:

```bash
cd gorasa-next

# Sync schema
node ../scripts/create-full-schema.js "postgresql://neondb_owner:****@ep-quiet-tooth-aiehj2mq.c-4.us-east-1.aws.neon.tech/gorasa-dev?sslmode=require"
node ../scripts/create-full-schema.js "postgresql://neondb_owner:****@ep-quiet-tooth-aiehj2mq.c-4.us-east-1.aws.neon.tech/gorasa-qa?sslmode=require"

# Copy data
node ../scripts/migrate-via-sql.js "postgresql://neondb_owner:****@ep-quiet-tooth-aiehj2mq-pooler.c-4.us-east-1.aws.neon.tech/gorasa-dev?sslmode=require&pgbouncer=true"
node ../scripts/migrate-via-sql.js "postgresql://neondb_owner:****@ep-quiet-tooth-aiehj2mq-pooler.c-4.us-east-1.aws.neon.tech/gorasa-qa?sslmode=require&pgbouncer=true"
```

---

## Scripts

| Script | Purpose |
|--------|---------|
| `create-full-schema.js` | Creates all tables in NEON matching Supabase schema |
| `migrate-via-sql.js` | Copies data from Supabase to NEON via SQL |
| `fix-schema.js` | Adds missing columns to NEON tables |
| `create-neon-dbs.js` | Creates gorasa-dev and gorasa-qa databases in NEON |
| `setup-github-secrets.sh` | Helper script for GitHub environment secrets |
| `verify-migration.js` | Verifies row counts match between databases |

---

## Safety Checklist

- [x] Production project (`gorasa-next`) is untouched
- [x] New projects have separate URLs
- [x] Environment variables are isolated
- [x] Database connections are separate (Supabase vs NEON)
- [x] SSO protection disabled for public access
- [x] GitHub Actions workflows tested and working
- [x] All 3 environments verified (HTTP 200, database connectivity)

---

## Important Notes

1. **NEON Free Tier**: 500MB storage, 190 compute hours/month
2. **Vercel Free Tier**: Supports multiple projects
3. **Root Directory**: Must be set to `gorasa-next/` for all projects
4. **SSO Protection**: Disabled for staging projects (public access)
5. **Connection Strings**: Stored in GitHub environment secrets (not in code)

---

## Troubleshooting

### Issue: Vercel build fails with "No Next.js version detected"
**Fix:** Set Root Directory to `gorasa-next/` in Vercel Dashboard → Settings → General

### Issue: GitHub Actions fails with "provided path does not exist"
**Fix:** Run `vercel deploy` from repo root, not `gorasa-next/` subdirectory

### Issue: SSO protection blocks access
**Fix:** Disable via Vercel API: `{"ssoProtection":null}`

### Issue: Database connection fails
**Fix:** Check NEON connection strings in GitHub environment secrets

---

## Resources

- [NEON Documentation](https://neon.tech/docs)
- [Vercel Multi-Environment](https://vercel.com/docs/concepts/deployments/environments)
- [GitHub Actions](https://docs.github.com/en/actions)
- [CONFIG-REFERENCE.md](CONFIG-REFERENCE.md#23-staging-environments-devqa) — Full staging configuration details
