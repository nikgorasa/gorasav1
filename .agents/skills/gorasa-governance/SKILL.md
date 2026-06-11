---
name: gorasa-governance
mode: subagent
description: |
  Enforce GoRASA project governance protocol for consistent, auditable, and model-agnostic development practices. This skill ensures all work follows mandatory pre-flight and post-task checklists, maintains comprehensive documentation, and adheres to cross-session governance standards.

  It automates governance checks through executable scripts and enforces:

  1. Pre-flight requirements (read docs, generate context brief, check current state)
  2. Post-task documentation (update learning logs, deployment logs, ADRs)
  3. Rule-based compliance (no changes without context, document all issues, track deployments)
  4. Verification protocols (TypeScript passes, tests pass, docs updated, deployment verified)

  Provides governance scripts and validation for all GoRASA project work.
color: success
---

# GoRASA Governance Protocol

## Overview

This skill enforces the **MANDATORY** GoRASA project governance framework that ensures consistent practices across all AI models and sessions. Non-compliance will result in incomplete work being rejected.

## How This Skill Works

The governance protocol operates through three primary mechanisms:

1. **Pre-flight validation** - Validates all setup and preparation before starting work
2. **Post-task verification** - Ensures all documentation and validation is complete after work
3. **Rule enforcement** - Maintains compliance with project governance rules

## Pre-Flight Checklist

### Step 1: Read Project Documentation

**MANDATORY** - Read these files FIRST:

```bash
# Must read before starting ANY significant work
cat ../Sprint-1.md                    # Sprint planning and status
cat ../LEARNING-FROM-MISTAKES.md      # Known issues and lessons
cat ../CONFIG-REFERENCE.md            # Configuration and setup
cat ../DEPLOYMENT_LOG.md              # Deployment history
```

### Step 2: Generate Context Brief

**MANDATORY** - Create `../CONTEXT-BRIEF-[ISSUE-NAME].md` with:

- **Problem statement** - Clear description of the issue to resolve
- **Investigation summary** - What was discovered during investigation
- **Root cause analysis** - Why the issue occurred
- **Resolution path** - How to fix it
- **Lessons learned** - What was learned from the investigation
- **Action items** - Specific tasks needed to complete the fix

### Step 3: Check Current State

**MANDATORY** - Verify project state before starting:

```bash
# Verify current state before making changes
git status                          # Working tree status
.git log --oneline -5               # Recent commits
npx tsc --noEmit                    # TypeScript compilation
```

## Post-Task Checklist

### Step 1: Update Learning Log

**MANDATORY** - If debugging took >30 minutes, update `../LEARNING-FROM-MISTAKES.md` with:

- **Issue number** - Sequential issue number
- **Date and duration** - When and how long it took
- **Severity level** - Impact of the issue
- **Symptoms observed** - What was noticed
- **Root cause analysis** - Complete analysis of the cause
- **Resolution steps** - How it was fixed
- **Lessons learned** - What was learned from the fix
- **Prevention measures** - How to prevent this in the future

### Step 2: Update Deployment Log

**MANDATORY** - If deployment changed, update `../DEPLOYMENT_LOG.md` with:

- **Date and commit SHA** - When and how changes were deployed
- **Project name** - GoRASA or specific component
- **Status (Ready/Failed)** - Deployment outcome
- **Production URL** - Where it can be accessed
- **ADR reference (if applicable)** - Link to any architectural decision record

### Step 3: Create ADR (if architectural decision)

**MANDATORY** - Any significant architectural decision requires:

- **ADR in docs/adr/ directory** - Properly named file
- **Status tracking** - Proposed/Accepted/Deprecated
- **Consequences documented** - What will happen and rollback plan

## Enforcement Rules

### Rule 1: No Changes Without Context

**NEVER** make significant changes without:

- Reading project documentation
- Understanding current state
- Generating context brief

### Rule 2: Document All Issues

**MANDATORY** - Every issue that takes >30 minutes to debug must be documented in `../LEARNING-FROM-MISTAKES.md` with complete root cause analysis and prevention measures.

### Rule 3: Track All Deployments

**MANDATORY** - Every deployment must be logged in `../DEPLOYMENT_LOG.md` with commit SHA, status, and production URL.

### Rule 4: Architectural Decisions Need ADRs

**MANDATORY** - Any significant architectural decision requires an ADR in `../docs/adr/` with proper status tracking and consequences documented.

### Rule 5: Verification Before Completion

**MANDATORY** - Before marking work complete, verify:

- TypeScript compilation must pass
- All tests must pass
- Documentation must be updated
- Deployment must be verified

## Scripts and Commands

### Automated Governance

This skill provides automatic governance checks through opencode hooks:

| Event | Action | Description |
|-------|--------|-------------|
| `file.changed` (code) | `npx tsc --noEmit` | TypeScript validation on every code change |
| `file.changed` (any) | Verify governance docs exist | Check docs exist on every file change |
| `session.idle` | Run `post-task-check.sh` | Post-task validation when session goes idle |
| `session.end` | Reminder to update docs | Remind to update docs on session close |

### Manual Governance

Run these scripts when needed:

```bash
# Before starting work
bash scripts/preflight-check.sh

# After completing work
bash scripts/post-task-check.sh
```

### Complete Workflow Commands

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

## Non-Compliance Protocol

If governance protocol is not followed:

1. **Immediate** - Document what was missed
2. **Corrective** - Update missing documentation
3. **Preventive** - Add to `../LEARNING-FROM-MISTAKES.md`
4. **Process** - Update governance framework if needed

## Files to Read Before Starting

1. `../Sprint-1.md` - Sprint planning and status
2. `../LEARNING-FROM-MISTAKES.md` - Known issues and lessons
3. `../CONFIG-REFERENCE.md` - Configuration and setup
4. `../DEPLOYMENT_LOG.md` - Deployment history
5. `../MEMORY.md` - Project memory (cross-session context)
6. `CHANGE-LOG.md` - Change log

## Files to Update After Work

1. `CHANGE-LOG.md` - Always update with changes made
2. `../MEMORY.md` - Update session context summary
3. `../LEARNING-FROM-MISTAKES.md` - If debugging >30 min
4. `../DEPLOYMENT_LOG.md` - If deployment changed
5. `../docs/adr/` - If architectural decision
6. `../CONTEXT-BRIEF-*.md` - For new issues

## Model-Agnostic Design

This governance framework works across all AI models because:

- **Global config** - Referenced in `~/.config/opencode/opencode.jsonc`
- **Project files** - Version-controlled with code
- **Documentation** - Human-readable and auditable
- **Enforcement** - Pre-flight and post-task checklists, hooks

This framework ensures consistent, auditable, and model-agnostic development practices for the GoRASA project.

## Quick Start

1. Run `bash scripts/preflight-check.sh` before starting any work
2. Execute your main task
3. Run `bash scripts/post-task-check.sh` after completing work
4. Use the governance skill anytime for protocol validation

The governance skill automates and enforces the GoRASA development protocol for consistent, auditable, and cross-session compliant work.