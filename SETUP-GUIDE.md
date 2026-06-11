# GoRASA Staging Environment Setup Guide

## Overview
This guide walks you through creating Dev and QA environments for GoRASA using separate Vercel projects and NEON databases.

---

## Architecture

| Environment | Vercel Project | Git Branch | Database | Domain |
|-------------|---------------|------------|----------|--------|
| Production | gorasa-next | main | Supabase | gorasa-next.vercel.app |
| Development | gorasa-dev | dev | NEON | gorasa-dev-*.vercel.app |
| QA | gorasa-qa | qa | NEON | gorasa-qa-*.vercel.app |

---

## Prerequisites

1. NEON account (free tier)
2. Vercel CLI installed: `npm i -g vercel`
3. Git branches created: `dev` and `qa`

---

## Step 1: Create NEON Databases

### 1.1 Sign up/Log in to NEON
- Visit: https://neon.tech
- Sign up or log in

### 1.2 Create a new project
- Click "New Project"
- Name: `gorasa`
- Region: Singapore (closest to your users)
- Click "Create"

### 1.3 Create databases
- In your NEON project, create 2 databases:
  - `gorasa-dev`
  - `gorasa-qa`

### 1.4 Get connection strings
For each database, get:
- **DATABASE_URL** (pooled connection)
- **DIRECT_URL** (direct connection)

**Format:**
```
DATABASE_URL=postgresql://[user]:[password]@[host-neon].aws.neon.tech/[database]?sslmode=require&pgbouncer=true&connect_timeout=10
DIRECT_URL=postgresql://[user]:[password]@[host-neon].aws.neon.tech/[database]?sslmode=require&connect_timeout=10
```

Save these for later (Step 4).

---

## Step 2: Migrate Schema from Supabase to NEON

### Option A: Using Prisma Migrations (Recommended)

Since the project uses Prisma, we can recreate the schema:

```bash
# For dev database:
DATABASE_URL=<neon-dev-database-url> npx prisma migrate deploy

# For qa database:
DATABASE_URL=<neon-qa-database-url> npx prisma migrate deploy
```

### Option B: Using SQL Dump (if you have pg_dump installed)

If you have PostgreSQL client tools installed locally:

```bash
# Export Supabase schema
pg_dump "postgresql://postgres.isubgeemvhvhnhikxbjb:Womanly%40Deem6%40Trivial@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres" \
  --schema-only > gorasa_schema.sql

# Export Supabase data
pg_dump "postgresql://postgres.isubgeemvhvhnhikxbjb:Womanly%40Deem6%40Trivial@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres" \
  --data-only > gorasa_data.sql

# Import to NEON
psql "<neon-connection-string>" < gorasa_schema.sql
psql "<neon-connection-string>" < gorasa_data.sql
```

---

## Step 3: Create Vercel Projects

### 3.1 Create gorasa-dev project

```bash
cd /home/nikhil/Downloads/Gorasa/App-1/rasa-zero-app-main/gorasa-next
npx vercel
```

When prompted:
- **Set up "gorasa-next"?** → No (we want a new project)
- **What's your project's name?** → `gorasa-dev`
- **Which directory is your code located?** → `gorasa-next/`
- **Want to override the settings?** → Yes (to set build command)
- **Build Command:** `npx prisma generate && npx next build`
- **Output Directory:** `.next`
- **Development Command:** `next dev`

### 3.2 Link to GitHub repository

In the Vercel Dashboard:
1. Go to your `gorasa-dev` project
2. Settings → Git
3. Connect to `nikgorasa/gorasav1`
4. Production Branch: `dev`

### 3.3 Set Root Directory

**Critical:** Set root directory to `gorasa-next/`

```bash
curl -X PATCH "https://api.vercel.com/v1/projects/[PROJECT_ID]?teamId=[TEAM_ID]" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rootDirectory":"gorasa-next"}'
```

Or set via Dashboard: Settings → General → Root Directory → `gorasa溯next`

### 3.4 Repeat for gorasa-qa

Same steps, but:
- Project name: `gorasa-qa`
- Production Branch: `qa`

---

## Step 4: Configure Environment Variables

### gorasa-dev Environment Variables

In Vercel Dashboard → gorasa-dev → Settings → Environment Variables:

```
# Supabase (same as production)
NEXT_PUBLIC_SUPABASE_URL=https://isubgeemvhvhnhikxbjb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<same-as-prod>
SUPABASE_SERVICE_ROLE_KEY=<same-as-prod>

# Database (NEON DEV)
DATABASE_URL=<neon-dev-pooled-url>
DIRECT_URL=<neon-dev-direct-url>

# TBO API (same as production - test credentials)
TBO_USERNAME=RasaT
TBO_PASSWORD=RasaT@123
TBO_HOTEL_USERNAME=TBOStaticAPITest
TBO_HOTEL_PASSWORD=Tbo@11530818
TBO_ENDPOINT=http://api.tbotechnology.in/hotelapi_v7/hotelservice.svc
```

### gorasa-qa Environment Variables

Same as dev, but with NEON QA URLs:

```
# Database (NEON QA)
DATABASE_URL=<neon-qa-pooled-url>
DIRECT_URL=<neon-qa-direct-url>
```

---

## Step 5: Deploy

### Deploy Dev
```bash
# Switch to dev branch
git checkout dev

# Push changes (if any)
git push neworigin dev

# Deploy will happen automatically via Git integration
```

### Deploy QA
```bash
# Switch to qa branch
git checkout qa

# Push changes (if any)
git push neworigin qa

# Deploy will happen automatically via Git integration
```

---

## Step 6: Verify Deployments

1. Visit dev URL: `https://gorasa-dev-*.vercel.app`
2. Visit QA URL: `https://gorasa-qa-*.vercel.app`
3. Test database connections
4. Verify environment variables are working

---

## Step 7: Update Documentation

After setup is complete, update:
- `DEPLOYMENT_LOG.md` with new project URLs
- `CONFIG-REFERENCE.md` with new database connections
- Add environment details to project README

---

## Troubleshooting

### Issue: "No Next.js version detected"
**Fix:** Ensure Root Directory is set to `gorasa-next/`

### Issue: Database connection fails
**Fix:** Check DATABASE_URL format - NEON requires `sslmode=require`

### Issue: Prisma migration fails
**Fix:** Use DIRECT_URL (not pooled DATABASE_URL) for migrations

### Issue: Auto-deploy not working
**Fix:** Check Git integration in Vercel Dashboard → Project → Git

---

## Next Steps (Optional)

### Add GitHub Actions for CI/CD
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to QA
on:
  push:
    branches: [qa]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: |
          npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_QA_PROJECT_ID }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
```

### Add Manual Approval for QA
In Vercel Dashboard → gorasa-qa → Git:
- Disable auto-deploy for production branch
- Use Vercel CLI for manual deployments

---

## Support

If you encounter issues:
1. Check Vercel build logs
2. Verify environment variables
3. Test database connections locally
4. Review the GoRASA Learning Log for common issues
