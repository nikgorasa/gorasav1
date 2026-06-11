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
**Never make significant changes without:**
- Reading project documentation
- Understanding current state
- Generating context brief

### Rule 2: Document All Issues
**Every issue that takes >30 minutes to debug must be documented in:**
- LEARNING-FROM-MISTAKES.md
- With complete root cause analysis
- With prevention measures

### Rule 3: Track All Deployments
**Every deployment must be logged in:**
- DEPLOYMENT_LOG.md
- With commit SHA and status
- With production URL

### Rule 4: Architectural Decisions Need ADRs
**Any significant architectural decision requires:**
- ADR in docs/adr/ directory
- Proper status tracking
- Consequences documented

### Rule 5: Verification Before Completion
**Before marking work complete:**
- TypeScript compilation must pass
- All tests must pass
- Documentation must be updated
- Deployment must be verified

---

## Quick Reference

### Files to Read Before Starting
1. `../Sprint-1.md` - Sprint planning
2. `../LEARNING-FROM-MISTAKES.md` - Known issues
3. `../CONFIG-REFERENCE.md` - Configuration
4. `../DEPLOYMENT_LOG.md` - Deployment history

### Files to Update After Work
1. `../LEARNING-FROM-MISTAKES.md` - If debugging >30 min
2. `../DEPLOYMENT_LOG.md` - If deployment changed
3. `../docs/adr/` - If architectural decision
4. `../CONTEXT-BRIEF-*.md` - For new issues

### Commands to Run
```bash
# Before starting:
git status
git log --oneline -5
npx tsc --noEmit

# After completing:
git add .
git commit -m "description"
git push neworigin main
```

---

## Non-Compliance Protocol

If governance protocol is not followed:
1. **Immediate:** Document what was missed
2. **Corrective:** Update missing documentation
3. **Preventive:** Add to LEARNING-FROM-MISTAKES.md
4. **Process:** Update governance framework if needed

---

## Model-Agnostic Design

This governance framework works across all AI models because:
- **Global config** - Referenced in `~/.config/opencode/opencode.jsonc`
- **Project files** - Version-controlled with code
- **Documentation** - Human-readable and auditable
- **Enforcement** - Pre-flight and post-task checklists

---

*This framework ensures consistent, auditable, and model-agnostic development practices for the GoRASA project.*
<!-- END:gorasa-governance -->