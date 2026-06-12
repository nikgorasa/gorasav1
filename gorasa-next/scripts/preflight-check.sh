#!/bin/bash

# GoRASA Pre-Flight Check Script
# MUST be run before starting ANY significant work
# ALL checks are COMPULSORY — failure exits immediately

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

print_status() { echo -e "${GREEN}[PRE-FLIGHT]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_header() { echo -e "${CYAN}════════════════════════════════════════════════════${NC}"; echo -e "${CYAN}  $1${NC}"; echo -e "${CYAN}════════════════════════════════════════════════════${NC}"; }

cd "$(dirname "$0")/.."

print_header "GoRASA Pre-Flight Check — COMPULSORY"
echo ""

ERRORS=0

# ═══════════════════════════════════════════════════════
# Check 1: Documentation Files Exist
# ═══════════════════════════════════════════════════════
print_status "CHECK 1/10: Required documentation files..."

REQUIRED_DOCS=(
    "../MEMORY.md"
    "../CHANGE-LOG.md"
    "../CONFIG-REFERENCE.md"
    "../LEARNING-FROM-MISTAKES.md"
    "../DEPLOYMENT_LOG.md"
    "../Sprint-1.md"
)

for doc in "${REQUIRED_DOCS[@]}"; do
    if [[ -f "$doc" ]]; then
        print_status "  ✓ $doc"
    else
        print_error "  ✗ $doc MISSING"
        ERRORS=$((ERRORS + 1))
    fi
done

# ═══════════════════════════════════════════════════════
# Check 2: Read MEMORY.md (Last Session Context)
# ═══════════════════════════════════════════════════════
print_status "CHECK 2/10: Last session context from MEMORY.md..."

MEMORY_FILE="../MEMORY.md"
if [[ -f "$MEMORY_FILE" ]]; then
    LAST_SESSION=$(grep -A 2 "## Session" "$MEMORY_FILE" | tail -3)
    print_status "  ✓ Last session context loaded"
else
    print_error "  ✗ MEMORY.md MISSING"
    ERRORS=$((ERRORS + 1))
fi

# ═══════════════════════════════════════════════════════
# Check 3: Read LEARNING-FROM-MISTAKES.md
# ═══════════════════════════════════════════════════════
print_status "CHECK 3/10: Known issues from LEARNING-FROM-MISTAKES.md..."

LFM="../LEARNING-FROM-MISTAKES.md"
if [[ -f "$LFM" ]]; then
    ISSUE_COUNT=$(grep -c "^## Issue" "$LFM" 2>/dev/null || echo "0")
    print_status "  ✓ $ISSUE_COUNT known issues documented"
else
    print_error "  ✗ LEARNING-FROM-MISTAKES.md MISSING"
    ERRORS=$((ERRORS + 1))
fi

# ═══════════════════════════════════════════════════════
# Check 4: Read CONFIG-REFERENCE.md
# ═══════════════════════════════════════════════════════
print_status "CHECK 4/10: Configuration from CONFIG-REFERENCE.md..."

CONFIG_REF="../CONFIG-REFERENCE.md"
if [[ -f "$CONFIG_REF" ]]; then
    print_status "  ✓ CONFIG-REFERENCE.md loaded"
else
    print_error "  ✗ CONFIG-REFERENCE.md MISSING"
    ERRORS=$((ERRORS + 1))
fi

# ═══════════════════════════════════════════════════════
# Check 5: Environment Variables
# ═══════════════════════════════════════════════════════
print_status "CHECK 5/10: Environment variables..."

ENV_FILE=".env.local"
if [[ -f "$ENV_FILE" ]]; then
    print_status "  ✓ .env.local exists"

    REQUIRED_VARS=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        "DATABASE_URL"
    )

    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "^${var}=" "$ENV_FILE" 2>/dev/null; then
            print_status "  ✓ $var set"
        else
            print_warning "  ⚠ $var not found"
        fi
    done
else
    print_error "  ✗ .env.local MISSING"
    ERRORS=$((ERRORS + 1))
fi

# ═══════════════════════════════════════════════════════
# Check 6: TypeScript Compilation
# ═══════════════════════════════════════════════════════
print_status "CHECK 6/10: TypeScript compilation..."

if command -v npx >/dev/null 2>&1; then
    if npx tsc --noEmit 2>/dev/null; then
        print_status "  ✓ TypeScript compilation successful"
    else
        print_error "  ✗ TypeScript compilation FAILED"
        ERRORS=$((ERRORS + 1))
    fi
else
    print_warning "  ⚠ npx not available, skipping"
fi

# ═══════════════════════════════════════════════════════
# Check 7: Git Status
# ═══════════════════════════════════════════════════════
print_status "CHECK 7/10: Git status..."

if git status >/dev/null 2>&1; then
    print_status "  ✓ Git repository detected"

    BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
    print_status "  ✓ Current branch: $BRANCH"

    UNSTAGED=$(git diff --name-only 2>/dev/null | wc -l)
    STAGED=$(git diff --cached --name-only 2>/dev/null | wc -l)

    if [[ "$UNSTAGED" -gt 0 ]]; then
        print_warning "  ⚠ $UNSTAGED unstaged changes"
    fi
    if [[ "$STAGED" -gt 0 ]]; then
        print_warning "  ⚠ $STAGED staged changes"
    fi
else
    print_error "  ✗ Not a git repository"
    ERRORS=$((ERRORS + 1))
fi

# ═══════════════════════════════════════════════════════
# Check 8: Recent Commits
# ═══════════════════════════════════════════════════════
print_status "CHECK 8/10: Recent commits..."

RECENT_COMMITS=$(git log --oneline -5 2>/dev/null || echo "No commits")
print_status "  ✓ Recent commits:"
echo "$RECENT_COMMITS" | while read -r line; do
    print_status "    $line"
done

# ═══════════════════════════════════════════════════════
# Check 9: Critical Files Exist
# ═══════════════════════════════════════════════════════
print_status "CHECK 9/10: Critical files..."

CRITICAL_FILES=(
    "src/lib/ticket/serverManager.ts"
    "src/lib/ai/holidayPlanner.ts"
    "src/lib/support/smartRouter.ts"
    "src/components/HolidayPlanner.tsx"
    "src/app/api/tickets/route.ts"
    "src/app/api/leads/route.ts"
    "src/app/holidays/page.tsx"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        print_status "  ✓ $file"
    else
        print_error "  ✗ $file MISSING"
        ERRORS=$((ERRORS + 1))
    fi
done

# ═══════════════════════════════════════════════════════
# Check 10: Governance Hooks
# ═══════════════════════════════════════════════════════
print_status "CHECK 10/10: Governance hooks..."

HOOKS_FILE="../.opencode/hook/hooks.yaml"
if [[ -f "$HOOKS_FILE" ]]; then
    print_status "  ✓ hooks.yaml exists"

    if grep -q "session.idle" "$HOOKS_FILE" 2>/dev/null; then
        print_status "  ✓ session.idle hook present"
    fi
else
    print_warning "  ⚠ hooks.yaml not found"
fi

# ═══════════════════════════════════════════════════════
# FINAL RESULT
# ═══════════════════════════════════════════════════════
echo ""
print_header "PRE-FLIGHT CHECK RESULT"

if [[ "$ERRORS" -gt 0 ]]; then
    print_error "FAILED — $ERRORS check(s) failed"
    print_error "Fix all errors before starting work"
    exit 1
else
    print_status "✓ ALL 10 CHECKS PASSED"
    print_status "✓ Pre-flight validation complete"
    print_status ""
    print_status "Ready to start work. Remember:"
    print_status "  1. Read project docs (Sprint-1.md, MEMORY.md)"
    print_status "  2. Generate context brief if new issue"
    print_status "  3. Run post-task-check.sh when done"
    exit 0
fi
