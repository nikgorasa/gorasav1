# GoRASA CockroachDB Standalone — Governance

> **This governance framework is MANDATORY for all work on the CockroachDB standalone deployment.**
> **It mirrors the GoRASA governance protocol but adapted for a single-branch, single-DB, no-staging pipeline.**
> **Non-compliance will result in incomplete work being rejected.**

---

## ⚠️ READ DEPLOY.md FIRST

**Before ANY deployment, read `../DEPLOY.md`** — it covers ALL projects (main pipeline + cockroach standalone).

```bash
cat ../DEPLOY.md
```

**Run command guard before ANY shell command:**
```bash
bash ../scripts/command-guard.sh "your command here"
```

---

## ⛔ BLOCKED ACTIONS

**NEVER DELETE:**
- `.env.local` — contains ALL credentials
- `.vercel/` — links to Vercel
- `vercel.json` — build config
- `prisma/schema.prisma` — database schema
- `.github/workflows/*.yml` — deploy automation

**NEVER RUN:**
- `vercel deploy --prod` — use PR instead
- `vercel env add` — ask user first
- `vercel link` — breaks config
- `rm .env.local` — deletes credentials
- `git push --force` — breaks history

**NEVER CHANGE WITHOUT USER APPROVAL:**
- Git remotes
- GitHub Actions workflows
- Vercel environment variables
- Supabase credentials
- Prisma schema

---

## Dual-Instance Architecture

This repository contains **two separate governance protocol instances** that coexist and activate conditionally based on the working directory:

| Instance | Root Directory | Prefix | Scripts | Source of Truth |
|----------|---------------|--------|---------|-----------------|
| **GoRASA Main** | `rasa-zero-app-main/` | (none) | `scripts/preflight-check.sh`, `scripts/post-task-check.sh` | `gorasa-next/AGENTS.md` |
| **Cockroach (Cckr)** | `cockroach-standalone/` | `Cckr-` | `scripts/Cckr-preflight-check.sh`, `scripts/Cckr-post-task-check.sh` | `Cckr-GOVERNANCE.md` |

### Activation Rule

| If invoked/PWD is... | Use this protocol | Read these docs | Run this script |
|---|---|---|---|
| `rasa-zero-app-main/` or any subdir (except `cockroach-standalone/`) | **GoRASA Main** | `MEMORY.md`, `CHANGE-LOG.md`, `CONFIG-REFERENCE.md`, `LEARNING-FROM-MISTAKES.md`, `DEPLOYMENT_LOG.md`, `Sprint-1.md` | `scripts/preflight-check.sh` |
| `rasa-zero-app-main/cockroach-standalone/` | **Cockroach (Cckr)** | `Cckr-MEMORY.md`, `Cckr-CHANGE-LOG.md`, `Cckr-CONFIG-REFERENCE.md`, `Cckr-LEARNING-FROM-MISTAKES.md`, `Cckr-DEPLOYMENT_LOG.md`, `Cckr-Sprint-1.md` | `scripts/Cckr-preflight-check.sh` |

### Detection Mechanism

A shared detection script at `scripts/detect-governance-root.sh` (in both roots) resolves the active instance by inspecting `$PWD`. All governance scripts use it to self-select the correct protocol, docs, and prefixes.

```
detect-governance-root.sh
  ├── $PWD matches */cockroach-standalone* → GOVERNANCE_TYPE=cckr
  └── $PWD matches everything else         → GOVERNANCE_TYPE=main
```

### File Resolution

All governance doc paths, script paths, and prefixes are derived from `GOVERNANCE_ROOT` and `GOVERNANCE_TYPE` — enabling all 8 post-task targets and 6 pre-flight docs to resolve correctly for either instance.

---

## Architecture Overview

```
GitHub: Gorasa-In-2026/Gorasa-Cockroach (main branch)
         ↓ manual push (no auto-deploy)
Vercel: project-10o7w (gorasa-next deployed)
         ↓
DB:     CockroachDB cluster aqua-pony-27730 (Prisma client)
Auth:   Supabase (isubgeemvhvhnhikxbjb) — kept as-is, NOT migrated
```

**Key differences from the DEV/QA/PROD pipeline:**
- Single `main` branch — no dev/qa/staging branches
- No auto-deploy — push manually when ready
- CockroachDB is the only database (no dual-mode, no `DATABASE_PROVIDER` switch)
- Prisma is the only DB client
- Supabase Auth remains unchanged (independent from DB)
- All 31 tables, 249 rows migrated, 14 FK constraints restored

---

## Operational Modes

### Plan Mode (Read-Only)
- **Only read and analyze** — no file changes, no shell commands, no commits
- Use for: research, analysis, planning, investigation
- Can read files, search code, create plans

### Build Mode (Read-Write)
- **Full access** — edit files, run commands, commit, deploy
- Use for: implementation, fixes, deployments
- Must still follow governance protocol before making changes

---

## Pre-Flight Checklist (MANDATORY)

**Before starting ANY significant work:**

### 1. Read Project Documentation
```bash
cat Cckr-MEMORY.md
cat Cckr-LEARNING-FROM-MISTAKES.md
cat Cckr-CONFIG-REFERENCE.md
cat Cckr-DEPLOYMENT_LOG.md
cat ../gorasa-next/AGENTS.md
```

### 2. Check Current State
```bash
git status
git log --oneline -5
cd ../gorasa-next && npx tsc --noEmit
```

---

## Post-Task Checklist (MANDATORY)

**After completing ANY significant task:**

### 1. Update Learning Log
If debugging took >30 minutes, update `Cckr-LEARNING-FROM-MISTAKES.md` with sequential issue entry.

### 2. Update Deployment Log
If deployment changed, update `Cckr-DEPLOYMENT_LOG.md` with date, commit SHA, status, URL.

### 3. Create ADR (if architectural decision)
Create `docs/adr/ADR-YYYYMMDD-NNN-title.md` with status, context, decision, consequences.

---

## Enforcement Rules

### Rule 1: No Changes Without Context
Read project docs and understand current state before making changes.

### Rule 2: Document All Issues
Every >30min debug session → `Cckr-LEARNING-FROM-MISTAKES.md` with root cause + prevention.

### Rule 3: Track All Deployments
Every deployment → `Cckr-DEPLOYMENT_LOG.md` with commit SHA, status, URL.

### Rule 4: Architectural Decisions Need ADRs
Significant decisions → ADR in `docs/adr/` with status tracking.

### Rule 5: Verification Before Completion
- TypeScript must compile (`npx tsc --noEmit`)
- Vercel deploy must return HTTP 200
- DB must be reachable via Prisma
- Docs updated (Cckr-MEMORY, Cckr-CHANGE-LOG, Cckr-CONFIG-REFERENCE)

### Rule 6: NEVER Force-Push to main
**NEVER force-push to `main` on Gorasa-Cockroach.** Always use normal push or PR.

---

## Files to Read Before Starting
1. `Cckr-MEMORY.md` — Session memory
2. `Cckr-LEARNING-FROM-MISTAKES.md` — Known issues
3. `Cckr-CONFIG-REFERENCE.md` — Configuration
4. `Cckr-DEPLOYMENT_LOG.md` — Deployment history
5. `Cckr-CHANGE-LOG.md` — Change log
6. `../gorasa-next/AGENTS.md` — Original governance protocol

## Files to Update After Work
1. `Cckr-CHANGE-LOG.md` — Always
2. `Cckr-MEMORY.md` — Always
3. `Cckr-LEARNING-FROM-MISTAKES.md` — If debugging >30 min
4. `Cckr-DEPLOYMENT_LOG.md` — If deployment changed
5. `docs/adr/` — If architectural decision
6. `Cckr-CONFIG-REFERENCE.md` — If config/keys/remotes changed
7. `Cckr-DB-CHANGES.md` — If any DB schema or data changes

---

## Non-Compliance Protocol
1. **Immediate:** Document what was missed
2. **Corrective:** Update missing documentation
3. **Preventive:** Add to Cckr-LEARNING-FROM-MISTAKES.md
4. **Process:** Update governance framework if needed

---

*This framework ensures consistent, auditable practices for the CockroachDB standalone deployment.*
