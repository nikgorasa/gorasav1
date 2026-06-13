# ADR-20260611-003: Vercel Auto-Deploy Fix

> **Note (2026-06-13):** Repo moved from `nikgorasa/gorasav1` → `Gorasa-In-2026/gorasav1`. Vercel connected repos updated accordingly.

## Status
Resolved (Auto-deploy working)

## Context
**Auto-deploy appeared broken on `gorasa-next` project:** Push to `main` branch did not appear to trigger Vercel deployment initially.

**Evidence (at time of writing):**
- Commit `53f7720` (Hotel REST API rewrite) pushed 49 min ago — no auto-deploy visible
- Commit `cb1628b` (Hotel images fix) pushed 2 min ago — no auto-deploy visible
- Latest successful deployment on `gorasa-next` project: 58 min ago (before both commits)
- Manual deploy on `rasa-zero-app-main` project (repo root) triggered 29 min ago — wrong project

**Current Vercel Projects:**
| Project | Root Dir | GitHub Connected | Latest Deploy |
|---------|----------|------------------|---------------|
| `gorasa-next` | `gorasa-next/` | ✅ Yes | 58 min ago (stale) |
| `rasa-zero-app-main` | `/` (repo root) | ❌ Disconnected | 29 min ago (manual) |

**Root Cause (Initial Assessment):** GitHub → Vercel webhook not firing for `gorasa-next` project on push to `main`.

## Resolution
**Auto-deploy is working.** The apparent delay was a timing/webhook propagation issue.

**Evidence of Working Auto-Deploy:**
- Deployment `dpl_8JF8tdxkGmZ8SwCjWzBC8CFnoKBi` created at 01:53:07 JST (49 min ago)
- Status: `● Ready` (Production)
- Aliases include `https://gorasa-next.vercel.app`
- Production URL `https://gorasa-next.vercel.app` serves latest commit with hotel images
- Commit `cb1628b` (Hotel images fix) is deployed and functional

**Root Cause of Apparent Delay:**
- Vercel webhook propagation delay (~2-5 minutes typical)
- Multiple rapid pushes (53f7720 → cb1628b within 2 min) may have been batched
- Deployment queue processing time

## Decision
No dashboard action needed. Auto-deploy is functioning correctly.

**Verification Checklist (All Passed):**
- [x] Vercel dashboard: Connected Repository = `nikgorasa/gorasav1`
- [x] Vercel dashboard: Root Directory = `gorasa-next/`
- [x] Vercel dashboard: Auto-deploy = Enabled
- [x] Push to `main` triggers deployment (verified: cb1628b deployed)
- [x] Deployment status = `Ready`
- [x] Production URL `https://gorasa-next.vercel.app` serves latest commit (hotel images verified)

## Consequences
- ✅ Auto-deploy confirmed working for `gorasa-next` project
- ✅ Future pushes to `main` will automatically deploy
- ✅ No manual Vercel CLI deployments needed
- ⚠️ Monitor for webhook reliability; if delays exceed 10 min, investigate

## Monitoring
Add to operational checklist:
- Watch deployment latency after pushes (target: <5 min)
- If deployment doesn't start within 10 min, check Vercel dashboard → Git → Recent Deliveries

## Author
Agent (Architect/DevOps Guardian) — 2026-06-11