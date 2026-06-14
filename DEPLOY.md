# DEPLOY — READ THIS BEFORE ANY PUSH

> **This is the ONLY file you need to read for deployment.**
> **Last updated:** 2026-06-15

---

## Git Remotes

```
origin    → https://github.com/Gorasa-In-2026/gorasav1.git   (main repo)
cockroach → https://github.com/Gorasa-In-2026/Gorasa-Cockroach.git (standalone)
```

**Always push to `origin`.** Never push to `cockroach` unless explicitly asked.

---

## Deployment Pipeline

| Branch | How to Deploy | Auto-Deploys To |
|--------|---------------|-----------------|
| `dev` | `git push origin dev` | https://project-uul0v.vercel.app |
| `qa` | PR into `qa` → merge | https://project-sm6gc.vercel.app |
| `main` | PR into `main` → merge | https://gorasa-next.vercel.app |

**ALL THREE auto-deploy on push.** No manual steps. No approval gates.

---

## Step-by-Step

### To deploy to DEV:
```bash
git checkout dev
git push origin dev
# Done — auto-deploys in ~2 min
```

### To deploy to QA:
```bash
git checkout -b my-feature
# ... make changes ...
git push origin my-feature
gh pr create --base qa --head my-feature
# Merge PR → auto-deploys
```

### To deploy to PROD:
```bash
# Changes must already be on dev and tested
gh pr create --base main --head dev
# Merge PR → auto-deploys
```

---

## NEVER Do This

- ❌ `git push origin main` — Always use PR for production
- ❌ `git push origin qa` — Branch protection blocks this
- ❌ Run `vercel deploy` manually — GitHub Actions handles it
- ❌ Change `deploy-prod.yml` trigger — it must stay `on: push: branches: [main]`

---

## ⛔ NEVER DELETE THESE FILES

These files are CRITICAL. Deleting them breaks everything:

| File | Why It Matters |
|------|----------------|
| `.env.local` | Contains ALL credentials (Supabase, TBO, Vercel) |
| `.vercel/` | Links project to Vercel — delete = broken deploys |
| `vercel.json` | Build config — delete = build fails |
| `prisma/schema.prisma` | Database schema — delete = no DB access |
| `node_modules/` | Dependencies — delete = app won't build |
| `.github/workflows/*.yml` | Deploy automation — delete = no auto-deploy |
| `DEPLOY.md` | This file — delete = AI agents get confused |

**If you see these files missing, STOP and ask the user. Do NOT recreate them.**

---

## ⛔ NEVER RUN THESE COMMANDS

| Command | Why It's Dangerous |
|---------|-------------------|
| `vercel deploy --prod` | Bypasses GitHub Actions — use PR instead |
| `vercel env add` | Changes env vars — ask user first |
| `vercel link` | Changes project link — breaks config |
| `rm .env.local` | Deletes all credentials |
| `rm -rf .vercel/` | Deletes Vercel project link |
| `rm -rf node_modules/` | Deletes dependencies (use npm install instead) |
| `git push --force` | Rewrites history — breaks everything |
| `gh secret delete` | Removes deploy secrets |

**If you need to run one of these, ASK THE USER FIRST.**

---

## ⛔ NEVER CHANGE THESE WITHOUT USER APPROVAL

| What | Why |
|------|-----|
| Git remotes | Breaks deploy pipeline |
| GitHub Actions workflows | Breaks auto-deploy |
| Vercel environment variables | Breaks production |
| Supabase credentials | Breaks auth |
| Prisma schema | Breaks database |

**Always ask before changing any of these.**

---

## Vercel Projects

| Project | ID | Branch |
|---------|-----|--------|
| gorasa-next | `prj_WLoI80KaCmVZSudP17ohcPbzTpSe` | main |
| dev-gorasa | `prj_BWE4hfy72DwYF39XamAwGYi3qg63` | dev |
| qa-gorasa | `prj_j2eXtGEfgMZqUeTxlMjE0TCyyBwN` | qa |

---

## GitHub Actions Workflows

| File | Trigger | Deploys To |
|------|---------|------------|
| `deploy-dev.yml` | push to `dev` | dev-gorasa |
| `deploy-qa.yml` | push to `qa` | qa-gorasa |
| `deploy-prod.yml` | push to `main` | gorasa-next |

---

## If Deploy Fails

1. Check GitHub Actions: `gh run list --limit=3`
2. View logs: `gh run view <ID> --log-failed`
3. Common causes:
   - **Token expired**: Update `VERCEL_TOKEN` in GitHub secrets
   - **Build error**: Run `npx next build` locally first
   - **Null assertion**: Wrap modals in `{selected && <Component />}`

---

## Pre-Push Check

Run before any push:
```bash
bash scripts/pre-push-check.sh
```

---

## Command Guard

Run before any shell command to check if it's safe:
```bash
bash scripts/command-guard.sh "your command here"
```

**Examples:**
```bash
bash scripts/command-guard.sh "vercel deploy --prod"  # BLOCKED
bash scripts/command-guard.sh "rm -rf .env.local"     # BLOCKED
bash scripts/command-guard.sh "git push origin dev"   # ALLOWED
bash scripts/command-guard.sh "git remote -v"         # REQUIRES APPROVAL
```

---

*This file is the single source of truth for deployment. If this conflicts with other docs, THIS FILE IS CORRECT.*
