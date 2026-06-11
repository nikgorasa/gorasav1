---
name: gorasa-deploy
description: |
  GoRASA deployment workflow: git push → Vercel auto-deploy → verify → log.
  Handles the project's dual-remote setup (origin=fork, neworigin=prod) and deployment logging.
  Triggers: deploying to production, pushing to main, Vercel deployment issues.
---

# GoRASA Deployment Workflow

Standardized deployment process for the GoRASA project. Handles dual-remote git setup, Vercel auto-deploy, and deployment logging.

## When to Use

- After completing a feature or bug fix
- When user says "deploy", "push", "ship it"
- Before starting new work (deploy current state first)
- When Vercel deployment fails

## Pre-Flight Checks

Before deploying, verify:

```bash
# 1. TypeScript compiles cleanly
npx tsc --noEmit

# 2. Build passes
npm run build 2>&1 | tail -5

# 3. Git status is clean
git status
```

**Do NOT deploy if:**
- TypeScript errors exist
- Build fails
- There are uncommitted changes that shouldn't go live

## Deployment Steps

### Step 1: Commit Changes

```bash
git add .
git commit -m "description of changes"
```

### Step 2: Push to Production Remote

```bash
# IMPORTANT: Use 'neworigin' not 'origin'
git push neworigin main
```

**Critical:** The project has two git remotes:
- `origin` = fork (nikjp2021) — does NOT trigger Vercel deploy
- `neworigin` = production (nikgorasa) — triggers Vercel auto-deploy

If you push to `origin`, nothing deploys. Always use `neworigin`.

### Step 3: Verify Deployment

1. Check Vercel dashboard for deployment status
2. Visit https://gorasa-next.vercel.app to verify
3. Check that the new commit SHA appears in deployment

### Step 4: Log Deployment

Update `DEPLOYMENT_LOG.md`:

```markdown
| 2026-06-XX | Short description | XXXXXXX | gorasa-next | ✅ Ready | gorasa-next-... | Notes |
```

Fields: Date, Description, Commit SHA, Project, Status, URL, Notes

## Troubleshooting

### Vercel Build Fails

1. Check Vercel build logs for the specific error
2. Common causes:
   - TypeScript errors (fix locally first)
   - Missing environment variables
   - Wrong root directory (should be `gorasa-next/`)

### Deploy Goes to Wrong Project

If `rasa-zero-app-main-*.vercel.app` instead of `gorasa-next-*.vercel.app`:
- You pushed to `origin` instead of `neworigin`
- Or Vercel project root directory is misconfigured

### Deployment Succeeds But Site is Broken

1. Check Vercel environment variables match `.env.local`
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is current (JWT rotates)
3. Check browser console for API errors

## Key Facts

| Field | Value |
|-------|-------|
| Production URL | https://gorasa-next.vercel.app |
| Vercel Project | gorasa-next |
| Root Directory | gorasa-next/ |
| GitHub Repo | nikgorasa/gorasav1 |
| Deploy Remote | neworigin → main |
| Supabase | isubgeemvhvhnhikxbjb |
| Auto-Deploy | Git push triggers Vercel build |
