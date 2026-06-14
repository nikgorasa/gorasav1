<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

<!-- BEGIN:gorasa-governance -->

# GoRASA Project Governance

> **This governance framework is MANDATORY for all work on this project.**  
> **It ensures consistent practices across all AI models and sessions.**  
> **Non-compliance will result in incomplete work being rejected.**  

---

## Operational Modes

The system can switch between two operational modes via system reminders:

### Plan Mode (Read-Only)
```
<system-reminder>
You are in plan mode. You MUST NOT make any edits, run any non-readonly tools...
</system-reminder>
```
- **Only read and analyze** — no file changes, no shell commands, no commits
- Use this mode for: research, analysis, planning, investigation
- You CAN read files, search code, and create plans

### Build Mode (Read-Write)
```
<system-reminder>
Your operational mode has changed from plan to build.
You are no longer in read-only mode.
</system-reminder>
```
- **Full access** — edit files, run commands, commit, deploy
- Use this mode for: implementation, fixes, deployments
- You MUST still follow governance protocol before making changes

### Mode Awareness Rules
1. **Always check for system reminders** at the start of each response
2. **Plan mode:** Do NOT edit files, run write commands, or commit
3. **Build mode:** Follow governance protocol, then implement
4. **If unsure:** Ask the user to clarify the expected mode

---

## Pre-Flight Checklist (MANDATORY)

**Before starting ANY significant work, you MUST:**

### 1. Read Project Documentation
```bash
# Read these files FIRST:
cat ../Sprint-1.md                    # Sprint planning and status
cat ../LEARNING-FROM-MISTAKES.md      # Known issues and lessons
cat ../CONFIG-REFERENCE.md            # Configuration and setup
cat ../DEPLOYMENT_LOG.md              # Deployment history
```

### 2. Generate Context Brief
Create `../CONTEXT-BRIEF-[ISSUE-NAME].md` with:
- Problem statement
- Investigation summary
- Root cause analysis
- Resolution path
- Lessons learned
- Action items

### 3. Check Current State
```bash
git status
git log --oneline -5
npx tsc --noEmit
```

---

## Post-Task Checklist (MANDATORY)

**After completing ANY significant task, you MUST:**

### 1. Update Learning Log
If debugging took >30 minutes, update `../LEARNING-FROM-MISTAKES.md` with:
- Issue number (sequential)
- Date and duration
- Severity level
- Symptoms observed
- Root cause analysis
- Resolution steps
- Lessons learned
- Prevention measures

### 2. Update Deployment Log
If deployment changed, update `../DEPLOYMENT_LOG.md` with:
- Date and commit SHA
- Project name
- Status (Ready/Failed)
- Production URL
- ADR reference (if applicable)

### 3. Create ADR (if architectural decision)
If making significant architectural decisions, create an ADR in `../docs/adr/`:
- ADR-YYYYMMDD-NNN-title.md
- Status (Proposed/Accepted/Deprecated)
- Context and decision
- Consequences and rollback plan

---

## Enforcement Rules

### Rule 1: No Changes Without Context
**Never** make significant changes without:
- Reading project documentation
- Understanding current state
- Generating context brief

### Rule 2: Document All Issues
**Every** issue that takes >30 minutes to debug must be documented in:
- LEARNING-FROM-MISTAKES.md
- With complete root cause analysis
- With prevention measures

### Rule 3: Track All Deployments
**Every** deployment must be logged in:
- DEPLOYMENT_LOG.md
- With commit SHA and status
- With production URL

### Rule 4: Architectural Decisions Need ADRs
**Any** significant architectural decision requires:
- ADR in docs/adr/ directory
- Proper status tracking
- Consequences documented

### Rule 5: Verification Before Completion
**Before** marking work complete:
- TypeScript compilation must pass
- All tests must pass
- Documentation must be updated
- Deployment must be verified

### Rule 6: NEVER Remove Branch Protection
**NEVER** remove branch protection from `main` or `qa` branches. This is a hard ban with zero exceptions.

- **NEVER** run `gh api .../branches/main/protection --method DELETE`
- **NEVER** run `gh api .../branches/qa/protection --method DELETE`
- **NEVER** use `--force` push to protected branches
- **NEVER** disable required reviews, even temporarily

**If you need to merge to a protected branch:** Create a PR and merge it normally.

**If protection is accidentally removed:** Run `bash scripts/restore-protection.sh` immediately.

**Enforced by:**
- `scripts/branch-protection-guard.sh` — runs on every session start and idle
- `hooks.yaml` — branch-protection-guard hook
- This rule (Rule 6)

**Why:** Force-pushing to protected branches rewrites history, breaks CI/CD, and can cause data loss. PRs ensure code review and audit trails.

---

## Quick Reference

### Files to Read Before Starting
1. `../Sprint-1.md` — Sprint planning
2. `../LEARNING-FROM-MISTAKES.md` — Known issues
3. `../CONFIG-REFERENCE.md` — Configuration
4. `../DEPLOYMENT_LOG.md` — Deployment history
5. `../MEMORY.md` — Project memory (cross-session context)
6. `CHANGE-LOG.md` — Change log

### Files to Update After Work (8 Targets)

Each `CHANGE-LOG.md` entry MUST include a checklist showing whether each of the 7 targets was updated:

```markdown
### 2026-06-12 — Description

**8-Target Checklist:**
- [x] CHANGE-LOG.md — Updated with this entry
- [x] MEMORY.md — Added session entry
- [ ] LEARNING-FROM-MISTAKES.md — No debugging >30min
- [x] DEPLOYMENT_LOG.md — Added deployment record
- [ ] docs/adr/ — No architectural decision
- [ ] CONTEXT-BRIEF-*.md — No new issue
- [x] CONFIG-REFERENCE.md — Updated repo URL + deploy pipeline
- [x] DEPLOYMENT-COMMIT-MAP.md — Updated by post-task Check 25
- [x] DB-CHANGES.md — Updated if any schema/data changes (Check 26)
```

1. `CHANGE-LOG.md` — Always
2. `../MEMORY.md` — Always
3. `../LEARNING-FROM-MISTAKES.md` — If debugging >30 min
4. `../DEPLOYMENT_LOG.md` — If deployment / pipeline changed
5. `../docs/adr/` — If architectural decision
6. `../CONTEXT-BRIEF-*.md` — For new issues
7. `../CONFIG-REFERENCE.md` — If config/keys/remotes/deploy-pipeline changed
8. `../docs/DEPLOYMENT-COMMIT-MAP.md` — Updated automatically by pre-flight Check 15 / post-task Check 25
9. `../DB-CHANGES.md` — If any DB schema or data changes

### Change-Type → Doc Map

| Change Type | Docs to Update | Sections |
|---|---|---|
| Git remote / repo URL | CONFIG-REFERENCE, DEPLOYMENT_LOG | §11 (Git), §3 (Pipeline), Baseline |
| Deploy pipeline (trigger, env, approval) | CONFIG-REFERENCE, DEPLOYMENT_LOG, MEMORY | §3, §23, History |
| Environment variable | CONFIG-REFERENCE | §6 (Source Map), §7 (Keys) |
| Supabase project / keys | CONFIG-REFERENCE, DEPLOYMENT_LOG | §12, §7 (Keys) |
| Database schema / tables | CONFIG-REFERENCE, MEMORY, DB-CHANGES | §13, ADR if breaking |
| Database data (nav, categories, config) | DB-CHANGES, DB-MIGRATION-PROD | Always log before + after |
| API route | CONFIG-REFERENCE | §15 (API Routes) |
| TBO credentials / endpoints | CONFIG-REFERENCE | §16 (TBO) |
| Architecture decision | ADR, MEMORY, CONFIG-REFERENCE | docs/adr/ |
| >30min debugging | LEARNING-FROM-MISTAKES | — |
| Any deployment | DEPLOYMENT_LOG | History |
| Deployment commit traceability | DEPLOYMENT-COMMIT-MAP | Check 15/25 |

### Pre-Flight Baseline Snapshot

Before starting work, record the current state of key doc values so post-task can detect drift:

```bash
echo "=== BASELINE $(date +%Y-%m-%d_%H:%M) ==="
echo "REMOTE: $(git remote get-url neworigin 2>/dev/null || echo 'N/A')"
echo "BRANCH: $(git branch --show-current)"
echo "COMMIT: $(git rev-parse --short HEAD)"
git fetch neworigin dev qa main 2>/dev/null || git fetch origin dev qa main 2>/dev/null
echo "DEV:   $(git rev-parse --short neworigin/dev 2>/dev/null)"
echo "QA:    $(git rev-parse --short neworigin/qa 2>/dev/null)"
echo "MAIN:  $(git rev-parse --short neworigin/main 2>/dev/null)"
# Record these for post-task comparison
```

### Commands to Run
```bash
# Before starting:
git status
git log --oneline -5
npx tsc --noEmit

# After completing:
bash ../scripts/post-task-check.sh  # 25 checks — MUST pass
```

---

## Non-Compliance Protocol

If governance protocol is not followed:
1. **Immediate:** Document what was missed
2. **Corrective:** Update missing documentation
3. **Preventive:** Add to LEARNING-FROM-MISTAKES.md
4. **Process:** Update governance framework if needed

---

## Governance Enforcement — Hooks

The `.opencode/hook/hooks.yaml` file automates governance checks:

| Event | Action | When |
|-------|--------|------|
| `file.changed` (code) | `npx tsc --noEmit` | On every code change |
| `file.changed` (any) | Verify governance docs exist | On every file change |
| `session.idle` | Run `post-task-check.sh` | When session goes idle |
| `session.end` | Reminder to update docs | On session close |

Run scripts manually:
```bash
bash scripts/preflight-check.sh    # Before starting work
bash scripts/post-task-check.sh    # After completing work
```

## Model-Agnostic Design

This governance framework works across all AI models because:
- **Global config** - Referenced in `~/.config/opencode/opencode.jsonc`
- **Project files** - Version-controlled with code
- **Documentation** - Human-readable and auditable
- **Enforcement** - Pre-flight and post-task checklists, hooks

---

*This framework ensures consistent, auditable, and model-agnostic development practices for the GoRASA project.*

---

## GoRASA Governance Skill

For programmatic governance, use the **gorasa-governance** skill which provides:

- Automated governance protocol enforcement
- Pre-flight and post-task validation scripts
- Comprehensive documentation guidance
- Model-agnostic compliance tracking

This skill complements the manual governance protocol with executable validation and automation capabilities.
<!-- END:gorasa-governance -->