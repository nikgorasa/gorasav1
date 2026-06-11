# GoRASA Staging Environment Setup

## Date: June 12, 2026
## Purpose: Create Dev and QA environments without impacting production

---

## What Was Done

### 1. Git Branches Created
- ✅ `dev` branch → for active development
- ✅ `qa` branch → for testing/QA

### 2. Documents Created
- `CONTEXT-BRIEF-STAGING-SETUP.md` - Context and plan
- `SETUP-GUIDE.md` - Complete step-by-step guide
- `scripts/setup-staging.sh` - Bash helper script
- `scripts/migrate-to-neon.js` - Prisma-based migration script
- `scripts/seed-neon.js` - Data seeding script for NEON

### 3. Configuration Files
- `gorasa-next/vercel-dev.json` - Vercel configuration template

---

## Next Steps (To Be Completed)

### Step 1: Create NEON Databases
1. Sign up at https://neon.tech (free tier)
2. Create project `gorasa`
3. Create databases: `gorasa-dev` and `gorasa-qa`
4. Save connection strings

### Step 2: Migrate Schema & Data
Run: `DATABASE_URL=<neon-url> npx prisma migrate deploy`

Or use the seed script: `node scripts/seed-neon.js <neon-url>`

### Step 3: Create Vercel Projects
- `gorasa-dev` (linked to `dev` branch)
- `gorasa-qa` (linked to `qa` branch)

### Step 4: Configure Environment Variables
Set per-project environment variables in Vercel Dashboard.

### Step 5: Deploy & Test
Push to `dev` or `qa` branch and verify deployments.

---

## Architecture

```
Repository: nikgorasa/gorasav1
├── main branch → gorasa-next (production) → Supabase
├── dev branch  → gorasa-dev (development)   → NEON
└── qa branch   → gorasa-qa (QA/testing)      → NEON
```

---

## Safety Checklist

- [x] Production project (`gorasa-next`) is untouched
- [x] New projects will have separate URLs
- [x] Environment variables are isolated
- [x] Database connections are separate (Supabase vs NEON)
- [x] Can test migrations safely on dev/qa

---

## Important Notes

1. **NEON Free Tier**: 500MB storage, 190 compute hours/month
2. **Vercel Free Tier**: Supports multiple projects (not just one!)
3. **Database Migration**: Use Prisma migrations or the provided seed script
4. **Environment Variables**: Each project has its own set in Vercel Dashboard
5. **Root Directory**: Must be set to `gorasa-next/` for all projects

---

## Resources

- [NEON Documentation](https://neon.tech/docs)
- [Vercel Multi-Environment](https://vercel.com/docs/concepts/deployments/environments)
- [Prisma Migration Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)
