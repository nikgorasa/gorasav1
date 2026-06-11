# GoRASA Governance Enforcement Mechanism

> **Purpose:** Explain how the governance protocol is enforced across all AI models and sessions  
> **Status:** Active - enforcement is now in place  

---

## How Governance is Enforced

### 1. Global Configuration (opencode.jsonc)

**Location:** `~/.config/opencode/opencode.jsonc`

```json
{
  "instructions": [
    "/home/nikhil/.config/opencode/agent-governance.md",
    "/home/nikhil/.config/opencode/gorasa-governance.md"
  ]
}
```

**How it works:**
- These files are loaded into the system prompt when a session starts
- The model sees these instructions at the beginning of every conversation
- **Limitation:** Instructions are loaded once at session start, not re-read before every action

### 2. Project-Level Governance (AGENTS.md)

**Location:** `gorasa-next/AGENTS.md`

**How it works:**
- When you run `/init` in opencode, it creates/updates AGENTS.md
- The model reads this file when working in the project directory
- Contains the full governance protocol with checklists
- **Limitation:** Model can ignore it after initial read

### 3. Git Pre-Commit Hook (Enforcement)

**Location:** `.git/hooks/pre-commit`

**How it works:**
- Runs automatically before every `git commit`
- Checks if governance protocol was followed
- **Blocks commits** if protocol not followed
- Forces compliance with:
  - Context Brief existence
  - Learning Log updates
  - Deployment Log updates
  - TypeScript compilation
  - ADR creation (if needed)

**This is the primary enforcement mechanism.**

---

## Enforcement Flow

### Before Making Changes (Pre-Flight)
1. Model reads AGENTS.md (governance protocol)
2. Model runs `./scripts/preflight-check.sh`
3. Model creates Context Brief
4. Model reads project documentation

### During Work
1. Model follows governance rules
2. Model updates Learning Log if debugging >30 min
3. Model creates ADR if architectural decision

### Before Committing (Enforcement)
1. Git pre-commit hook runs automatically
2. Hook checks:
   - ✅ Context Brief exists
   - ✅ Learning Log updated (if needed)
   - ✅ Deployment Log updated (if needed)
   - ✅ TypeScript compiles
   - ✅ ADR exists (if needed)
3. **Commit blocked** if any check fails

---

## How to Ensure Compliance

### For AI Models
1. **Read AGENTS.md** before starting work
2. **Run preflight-check.sh** before making changes
3. **Create Context Brief** for new issues
4. **Update Learning Log** after debugging sessions
5. **Run post-task-check.sh** after completing work

### For Humans
1. **Review governance files** in project root
2. **Check pre-commit hook** is active
3. **Verify compliance** before pushing
4. **Update governance** if needed

---

## Verification Commands

### Check if governance is active
```bash
# Check AGENTS.md exists
ls -la gorasa-next/AGENTS.md

# Check pre-commit hook
ls -la .git/hooks/pre-commit

# Check global instructions
cat ~/.config/opencode/opencode.jsonc | jq '.instructions'
```

### Test enforcement
```bash
# Try to commit without following protocol
git add .
git commit -m "test"  # Should fail if protocol not followed
```

### Run governance checks manually
```bash
# Pre-flight check
./gorasa-next/scripts/preflight-check.sh

# Post-task check
./gorasa-next/scripts/post-task-check.sh
```

---

## Non-Compliance Consequences

If governance protocol is not followed:

1. **Pre-commit hook blocks commit**
2. **Work cannot be saved to git**
3. **Must update documentation** to proceed
4. **Must create Context Brief** if missing
5. **Must update Learning Log** if debugging >30 min

---

## Model-Agnostic Design

This governance framework works across all AI models because:

1. **Global config** - Referenced in opencode's instruction system
2. **Project files** - Version-controlled with code
3. **Git hooks** - Enforced at the version control level
4. **Documentation** - Human-readable and auditable
5. **Scripts** - Executable verification checks

**Any model that works on this project must follow the governance protocol or be blocked by the pre-commit hook.**

---

## Summary

| Enforcement Level | Location | How It Works |
|-------------------|----------|--------------|
| **Global** | `~/.config/opencode/opencode.jsonc` | Loaded into system prompt at session start |
| **Project** | `gorasa-next/AGENTS.md` | Read by model when working in project |
| **Git Hook** | `.git/hooks/pre-commit` | Blocks commits if protocol not followed |
| **Scripts** | `scripts/preflight-check.sh` | Manual verification before changes |
| **Scripts** | `scripts/post-task-check.sh` | Manual verification after changes |

**The primary enforcement is the git pre-commit hook, which blocks non-compliant commits.**

---

*This document explains how the GoRASA governance protocol is enforced. Update this if the enforcement mechanism changes.*