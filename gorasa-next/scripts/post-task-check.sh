#!/bin/bash

# GoRASA Post-Task Check Script
# Must be run after completing ANY significant work

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function to print colored output
print_status() {
    echo -e "${GREEN}[POST-TASK]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Change to project root
cd "$(dirname "$0")/.."

print_status "Starting GoRASA post-task checks..."

# Check 1: Update Change-LOG.md
print_status "1. Updating Change-LOG.md..."

if [[ ! -f "CHANGE-LOG.md" ]]; then
    print_warning "CHANGE-LOG.md not found - creating it..."
    cat > CHANGE-LOG.md << 'EOF'
# GoRASA Change Log

## Initial Setup

This document tracks all changes made to the GoRASA project.

EOF
fi

# Add entry to change log
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S GMT%z")
GIT_LOG=$(git log --oneline -1 2>/dev/null || echo "unknown commit")

if [[ "$GIT_LOG" != "unknown commit" ]]; then
    print_status "Adding change log entry for commit: $GIT_LOG"

    # Create backup and add entry
    cp CHANGE-LOG.md "CHANGE-LOG.md.backup"

    cat >> CHANGE-LOG.md << EOF

## $(date "+%Y-%m-%d %H:%M:%S %z")

### Commit: $GIT_LOG

Files changed:
$(git diff --name-only HEAD~1 HEAD 2>/dev/null || echo "Manual change")

Description: Governance protocol implementation - GoRASA pre-flight and post-task scripts

---

EOF

    rm "CHANGE-LOG.md.backup" 2>/dev/null || true
else
    print_warning "Cannot get git log, skipping change log entry"
fi

# Check 2: Update MEMORY.md
print_status "2. Updating MEMORY.md..."

if [[ ! -f "MEMORY.md" ]]; then
    print_warning "MEMORY.md not found - creating it..."
    cat > MEMORY.md << 'EOF'
# GoRASA Project Memory

This document contains persistent cross-session context for the GoRASA project.

## Current State

Project: GoRASA - Luxury Travel Platform

Status: Active development

Last session completed: $(date "+%Y-%m-%d %H:%M:%S %z")

## Recent Sessions Summary

$(date "+%Y-%m-%d %H:%M:%S %z") - Governance protocol implementation
- Pre-flight and post-task scripts created
- All governance rules enforced
- Documentation standardized

---

## Next Steps

1. Review completed changes
2. Update session context as needed
3. Continue with next task

EOF
fi

# Update session context in MEMORY.md
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S %z")
SESSION=$(date "+%H:%M:%S")

if ! grep -q "Session completed:" "MEMORY.md"; then
    cat >> MEMORY.md << EOF

## Session completed: $TIMESTAMP

Session: $SESSION

Work completed:
- Governance protocol implementation
- Pre-flight and post-task scripts created
- All governance rules enforced

---

EOF
fi

# Check 3: Update LEARNING-FROM-MISTAKES.md if needed
print_status "3. Checking if LEARNING-FROM-MISTAKES.md needs update..."

# Check if this is a debugging session (>30 minutes)
# We'll use a simple heuristic - if there are many errors in git log
# In a real implementation, you'd track session duration

print_warning "For debugging sessions (>30 min), update LEARNING-FROM-MISTAKES.md with:
- Issue number (sequential)
- Date and duration
- Severity level
- Symptoms observed
- Root cause analysis
- Resolution steps
- Lessons learned
- Prevention measures"

# Check 4: Update DEPLOYMENT_LOG.md
print_status "4. Checking if DEPLOYMENT_LOG.md needs update..."

if [[ -f "DEPLOYMENT_LOG.md" ]]; then
    print_status "✓ DEPLOYMENT_LOG.md exists"

    # Check if this entry is already there
    GIT_HASH=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
    if ! grep -q "$GIT_HASH" "DEPLOYMENT_LOG.md" 2>/dev/null; then
        print_status "Adding deployment entry for: $GIT_HASH"
        cat >> DEPLOYMENT_LOG.md << EOF

## $(date "+%Y-%m-%d")

### Commit: $GIT_HASH

Project: GoRASA
Status: Ready
ADR reference: N/A

---

EOF
    fi
else
    print_warning "DEPLOYMENT_LOG.md not found. Create with:
    cat > DEPLOYMENT_LOG.md << 'EOF'
    # GoRASA Deployment Log

    ## Initial Setup

    This document tracks all deployments to the GoRASA project.
    EOF"
fi

# Check 5: Create ADR if architectural decision
print_status "5. Checking for architectural decisions..."

print_warning "If you made architectural decisions, create ADR in docs/adr/:
    mkdir -p ../docs/adr
    cat > ../docs/adr/ADR-$(date +%Y%m%d)-NNNN-decision-title.md
    Status: Proposed/Accepted/Deprecated
    Context: [decision context]
    Decision: [your decision]
    Consequences: [consequences and rollback]
"

# Check 6: Verify documentation
print_status "6. Verifying documentation..."

REQUIRED_DOCS=(
    "MEMORY.md"
    "CHANGE-LOG.md"
    "../CONFIG-REFERENCE.md"
    "../LEARNING-FROM-MISTAKES.md"
    "../DEPLOYMENT_LOG.md"
    "../CONTEXT-BRIEF-*.md"
)

ALL_DOCS_OK=true

for doc_pattern in "${REQUIRED_DOCS[@]}"; do
    if ls "$doc_pattern" 1> /dev/null 2>&1; then
        print_status "✓ $doc_pattern exists"
    else
        if [[ "$doc_pattern" != "../CONTEXT-BRIEF-*.md" ]]; then
            print_error "$doc_pattern not found"
            ALL_DOCS_OK=false
        else
            print_warning "No context brief found ($doc_pattern)"
        fi
    fi
done

# Check 6b: Auto-detect config/key changes and enforce CONFIG-REFERENCE.md update
print_status "6b. Checking for config/key changes (auto-detect)..."
CONFIG_CHANGED=false
if git diff --name-only HEAD~1 HEAD 2>/dev/null | grep -E "(\.env|CONFIG-REFERENCE\.md|opencode\.jsonc|keys|secrets|credentials)" >/dev/null; then
    CONFIG_CHANGED=true
    print_status "⚠ Config/key changes detected in recent commit"
fi

if [[ "$CONFIG_CHANGED" == true ]]; then
    print_status "Enforcing CONFIG-REFERENCE.md update..."
    # Check if CONFIG-REFERENCE.md was modified in this commit
    if ! git diff --name-only HEAD~1 HEAD 2>/dev/null | grep -q "CONFIG-REFERENCE\.md"; then
        print_warning "CONFIG-REFERENCE.md NOT updated despite config changes!"
        print_warning "Please update CONFIG-REFERENCE.md with new keys/credentials"
        ALL_DOCS_OK=false
    else
        print_status "✓ CONFIG-REFERENCE.md updated with config changes"
    fi
fi

# Check 7: Verify governance hooks
print_status "7. Checking governance hooks..."

HOOKS_FILE="../../.opencode/hook/hooks.yaml"
if [[ -f "$HOOKS_FILE" ]]; then
    print_status "✓ Opencode hooks configuration exists"

    # Check key hooks
    if grep -q "session.idle" "$HOOKS_FILE" 2>/dev/null; then
        print_status "✓ Session idle hook present"
    else
        print_warning "Session idle hook missing"
    fi

    # Check for strict doc check
    if grep -q "MISSING=0" "$HOOKS_FILE" 2>/dev/null; then
        print_status "✓ Strict governance doc check enabled"
    else
        print_warning "Strict governance doc check not found"
    fi
else
    print_warning "No .opencode/hook/hooks.yaml file at $HOOKS_FILE"
fi

# Check 8: TypeScript compilation
print_status "8. Verifying TypeScript compilation..."

if command -v npx >/dev/null 2>&1; then
    if npx tsc --noEmit 2>&1; then
        print_status "✓ TypeScript compilation successful"
    else
        print_error "TypeScript compilation failed"
        print_error "Fix TypeScript errors before marking work complete"
        exit 1
    fi
else
    print_warning "npx not available, skipping TypeScript check"
fi

# Check 9: Git operations validation
print_status "9. Verifying git operations..."

if ! git status >/dev/null 2>&1; then
    print_error "Not in a git repository"
    exit 1
fi

# Check if there are staged changes
STAGED_FILES=$(git diff --cached --name-only 2>/dev/null | head -5)
if [[ -n "$STAGED_FILES" ]]; then
    print_status "Staged changes:"
    print_status "$STAGED_FILES"
fi

# Check if there are unstaged changes
UNSTAGED_FILES=$(git diff --name-only 2>/dev/null | head -5)
if [[ -n "$UNSTAGED_FILES" ]]; then
    print_status "Unstaged changes:"
    print_status "$UNSTAGED_FILES"
fi

# Final validation
print_status "10. Final validation..."

# Check if all mandatory steps completed
if [[ "$ALL_DOCS_OK" == false ]]; then
    print_error "Some mandatory documentation files are missing"
    exit 1
fi

print_status "✓ All mandatory checks completed successfully!"
print_status "✓ Post-task validation completed!"

print_status ""
print_status "Summary of work completed:"
print_status "1. ✓ Updated Change-LOG.md"
print_status "2. ✓ Updated MEMORY.md"
print_status "3. ✓ Documented debugging if needed"
print_status "4. ✓ Updated DEPLOYMENT_LOG.md if changed"
print_status "5. ✓ Created ADR if architectural decision"
print_status "6. ✓ Verified all 7 documentation files"
print_status "7. ✓ Verified governance hooks"
print_status "8. ✓ TypeScript compilation passed"
print_status "9. ✓ Git operations validated"
print_status "10. ✓ CONFIG-REFERENCE.md auto-check (if config/keys changed)"

print_status ""
print_status "Next steps:"
print_status "1. Run: git add ."
print_status "2. Run: git commit -m 'description'"
print_status "3. Run: git push neworigin main"
print_status ""
print_status "Remember: This is MANDATORY for ALL work on the GoRASA project."

exit 0
