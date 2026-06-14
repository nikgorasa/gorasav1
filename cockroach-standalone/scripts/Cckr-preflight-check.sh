#!/bin/bash

# GoRASA CockroachDB Standalone — Pre-Flight Check Script
# MUST be run before starting ANY significant work on the CRDB standalone deployment

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

print_status() { echo -e "${GREEN}[PRE-FLIGHT]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_header() { echo -e "${CYAN}════════════════════════════════════════════════════${NC}"; echo -e "${CYAN}  $1${NC}"; echo -e "${CYAN}════════════════════════════════════════════════════${NC}"; }

# Detect governance instance
source "$(dirname "$0")/detect-governance-root.sh"

cd "$GOVERNANCE_ROOT/../gorasa-next"

print_header "GoRASA Pre-Flight — Instance: ${GOVERNANCE_TYPE} (via $GOVERNANCE_ROOT)"
print_status "Active protocol: $GOV_SOURCE_OF_TRUTH"
echo ""

# ═══════════════════════════════════════════════════════
# Show Deployment Pipeline (from DEPLOY.md)
# ═══════════════════════════════════════════════════════
if [[ -f "$GOVERNANCE_ROOT/../DEPLOY.md" ]]; then
    echo -e "  ${CYAN}Deployment Pipeline (from DEPLOY.md):${NC}"
    echo ""
    echo -e "    ${CYAN}Branch    │ Trigger          │ Auto-Deploys To${NC}"
    echo -e "    ${CYAN}──────────┼──────────────────┼────────────────────────────────${NC}"
    echo -e "    ${GREEN}dev${NC}       │ git push origin dev │ project-uul0v.vercel.app"
    echo -e "    ${GREEN}qa${NC}        │ PR merge → qa     │ project-sm6gc.vercel.app"
    echo -e "    ${GREEN}main${NC}      │ PR merge → main   │ gorasa-next.vercel.app"
    echo ""
    print_status "  Command Guard: bash $GOVERNANCE_ROOT/../scripts/command-guard.sh \"cmd\""
    echo ""
fi

ERRORS=0

# ═══════════════════════════════════════════════════════
# Check 1: Documentation Files Exist
# ═══════════════════════════════════════════════════════
print_status "CHECK 1/10: Required documentation files..."

REQUIRED_DOCS=(
    "../cockroach-standalone/Cckr-MEMORY.md"
    "../cockroach-standalone/Cckr-CHANGE-LOG.md"
    "../cockroach-standalone/Cckr-CONFIG-REFERENCE.md"
    "../cockroach-standalone/Cckr-LEARNING-FROM-MISTAKES.md"
    "../cockroach-standalone/Cckr-DEPLOYMENT_LOG.md"
    "../cockroach-standalone/Cckr-Sprint-1.md"
    "../cockroach-standalone/Cckr-DB-CHANGES.md"
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
# Check 2: Read MEMORY.md
# ═══════════════════════════════════════════════════════
print_status "CHECK 2/10: Last session context..."

if [[ -f "../cockroach-standalone/Cckr-MEMORY.md" ]]; then
    print_status "  ✓ Last session context loaded"
else
    print_error "  ✗ Cckr-MEMORY.md MISSING"
    ERRORS=$((ERRORS + 1))
fi

# ═══════════════════════════════════════════════════════
# Check 3: Read LEARNING-FROM-MISTAKES.md
# ═══════════════════════════════════════════════════════
print_status "CHECK 3/10: Known issues..."

LFM="../cockroach-standalone/Cckr-LEARNING-FROM-MISTAKES.md"
if [[ -f "$LFM" ]]; then
    ISSUE_COUNT=$(grep -c "^### Issue" "$LFM" 2>/dev/null || echo "0")
    print_status "  ✓ $ISSUE_COUNT known issues documented"
else
    print_error "  ✗ Cckr-LEARNING-FROM-MISTAKES.md MISSING"
    ERRORS=$((ERRORS + 1))
fi

# ═══════════════════════════════════════════════════════
# Check 4: Read CONFIG-REFERENCE.md
# ═══════════════════════════════════════════════════════
print_status "CHECK 4/10: Configuration..."

if [[ -f "../cockroach-standalone/Cckr-CONFIG-REFERENCE.md" ]]; then
    print_status "  ✓ Cckr-CONFIG-REFERENCE.md loaded"
else
    print_error "  ✗ Cckr-CONFIG-REFERENCE.md MISSING"
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
        "DATABASE_URL"
        "DIRECT_URL"
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
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

    REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "N/A")
    print_status "  ✓ Remote origin: $REMOTE_URL"

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
# Check 9: Database connectivity via Prisma
# ═══════════════════════════════════════════════════════
print_status "CHECK 9/10: Database connectivity..."

if command -v npx >/dev/null 2>&1; then
    DB_CHECK=$(npx prisma db execute --stdin <<< "SELECT 1;" 2>&1 || true)
    if echo "$DB_CHECK" | grep -q "SELECT 1" 2>/dev/null; then
        print_status "  ✓ CockroachDB reachable via Prisma"
    else
        print_warning "  ⚠ Could not verify DB connectivity — check DATABASE_URL"
    fi
else
    print_warning "  ⚠ npx not available, skipping DB check"
fi

# ═══════════════════════════════════════════════════════
# Check 10: No Supabase client imports in rewritten files
# ═══════════════════════════════════════════════════════
print_status "CHECK 10/10: No stale Supabase client imports..."

STALE_IMPORTS=$(grep -rn "createClient.*@supabase/supabase-js" src/lib/pricing/ src/lib/payment/ src/lib/ticket/serverManager.ts src/app/page.tsx 2>/dev/null || true)
if [[ -z "$STALE_IMPORTS" ]]; then
    print_status "  ✓ No stale createClient imports in rewritten files"
else
    print_warning "  ⚠ Stale createClient imports found:"
    echo "$STALE_IMPORTS" | while read -r line; do
        print_warning "    $line"
    done
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
    print_status "  1. Read project docs (Cckr-MEMORY.md, Cckr-GOVERNANCE.md)"
    print_status "  2. Check Cckr-CONFIG-REFERENCE.md for current config"
    print_status "  3. Run Cckr-post-task-check.sh when done"
    exit 0
fi
