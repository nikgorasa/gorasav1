# Context Brief: Staging & QA Environment Setup

## Problem Statement
Need to create Dev (Staging) and QA environments on Vercel using separate NEON databases, without impacting the existing production deployment.

## Investigation Summary
- Current: 1 Vercel project (`gorasa-next`) + 1 Supabase database
- Target: 3 Vercel projects (prod, dev, qa) + 1 Supabase + 2 NEON databases
- Repo already uses `gorasa-next/` as root directory
- Prisma ORM used for database access
- 27 tables in Supabase need to be migrated to NEON

## Root Cause Analysis
N/A - This is a new feature, not a bug fix.

## Resolution Path
1. Create git branches (dev, qa)
2. Set up 2 NEON databases with schema + data migrated from Supabase
3. Create 2 new Vercel projects linked to dev/qa branches
4. Configure environment variables per project
5. Verify deployments work
6. Update documentation

## Safety Measures
- Production (`main` branch + `gorasa-next` project) should NOT be touched
- All new work happens on `dev` and `qa` branches
- New Vercel projects will be separate from existing one
- Environment variables will be completely isolated

## Action Items
- [ ] Create dev branch
- [ ] Create qa branch
- [ ] Create NEON databases (gorasa-dev, gorasa-qa)
- [ ] Migrate schema from Supabase to NEON
- [ ] Migrate data from Supabase to NEON
- [ ] Create vercel project gorasa-dev
- [ ] Create vercel project gorasa-qa
- [ ] Configure env vars for dev
- [ ] Configure env vars for qa
- [ ] Test deployments
- [ ] Update documentation
