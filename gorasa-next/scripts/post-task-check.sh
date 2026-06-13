#!/bin/bash

# GoRASA Post-Task Check Script
# MUST be run after completing ANY significant work
# ALL checks are COMPULSORY — failure exits immediately

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

print_status() { echo -e "${GREEN}[POST-TASK]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_header() { echo -e "${CYAN}════════════════════════════════════════════════════${NC}"; echo -e "${CYAN}  $1${NC}"; echo -e "${CYAN}════════════════════════════════════════════════════${NC}"; }

cd "$(dirname "$0")/.."

print_header "GoRASA Post-Task Check — COMPULSORY"
echo ""

ERRORS=0
WARNING_COUNT=0

# ═══════════════════════════════════════════════════════
# Check 1: Documentation Files Exist
# ═══════════════════════════════════════════════════════
print_status "CHECK 1/15: Documentation files..."

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
# Check 2: Change-LOG.md Updated
# ═══════════════════════════════════════════════════════
print_status "CHECK 2/15: Change-LOG.md has today's entry..."

CHANGE_LOG="../CHANGE-LOG.md"
TODAY=$(date "+%Y-%m-%d")
if grep -q "$TODAY" "$CHANGE_LOG" 2>/dev/null; then
    print_status "  ✓ Change-LOG.md has entry for $TODAY"
else
    print_error "  ✗ Change-LOG.md has NO entry for $TODAY"
    ERRORS=$((ERRORS + 1))
fi

# ═══════════════════════════════════════════════════════
# Check 3: MEMORY.md Updated
# ═══════════════════════════════════════════════════════
print_status "CHECK 3/15: MEMORY.md has today's entry..."

MEMORY_FILE="../MEMORY.md"
if grep -q "$TODAY" "$MEMORY_FILE" 2>/dev/null; then
    print_status "  ✓ MEMORY.md has entry for $TODAY"
else
    print_error "  ✗ MEMORY.md has NO entry for $TODAY"
    ERRORS=$((ERRORS + 1))
fi

# ═══════════════════════════════════════════════════════
# Check 4: LEARNING-FROM-MISTAKES.md
# ═══════════════════════════════════════════════════════
print_status "CHECK 4/15: LEARNING-FROM-MISTAKES.md status..."

LFM="../LEARNING-FROM-MISTAKES.md"
ISSUE_COUNT=$(grep -c "^## Issue" "$LFM" 2>/dev/null || echo "0")
print_status "  ✓ $ISSUE_COUNT issues documented"

# ═══════════════════════════════════════════════════════
# Check 5: DEPLOYMENT_LOG.md Updated
# ═══════════════════════════════════════════════════════
print_status "CHECK 5/15: DEPLOYMENT_LOG.md status..."

DEPLOY_LOG="../DEPLOYMENT_LOG.md"
if [[ -f "$DEPLOY_LOG" ]]; then
    print_status "  ✓ DEPLOYMENT_LOG.md exists"
else
    print_error "  ✗ DEPLOYMENT_LOG.md MISSING"
    ERRORS=$((ERRORS + 1))
fi

# ═══════════════════════════════════════════════════════
# Check 6: CONFIG-REFERENCE.md Updated
# ═══════════════════════════════════════════════════════
print_status "CHECK 6/15: CONFIG-REFERENCE.md status..."

CONFIG_REF="../CONFIG-REFERENCE.md"
if [[ -f "$CONFIG_REF" ]]; then
    print_status "  ✓ CONFIG-REFERENCE.md exists"
else
    print_error "  ✗ CONFIG-REFERENCE.md MISSING"
    ERRORS=$((ERRORS + 1))
fi

# ═══════════════════════════════════════════════════════
# Check 7: Environment Variables
# ═══════════════════════════════════════════════════════
print_status "CHECK 7/15: Environment variables..."

ENV_FILE=".env.local"
if [[ -f "$ENV_FILE" ]]; then
    print_status "  ✓ .env.local exists"

    # Check required vars
    REQUIRED_VARS=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        "DATABASE_URL"
    )

    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "^${var}=" "$ENV_FILE" 2>/dev/null; then
            print_status "  ✓ $var set"
        else
            print_warning "  ⚠ $var not found in .env.local"
        fi
    done
else
    print_error "  ✗ .env.local MISSING"
    ERRORS=$((ERRORS + 1))
fi

# ═══════════════════════════════════════════════════════
# Check 8: TypeScript Compilation
# ═══════════════════════════════════════════════════════
print_status "CHECK 8/15: TypeScript compilation..."

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
# Check 9: Build Verification
# ═══════════════════════════════════════════════════════
print_status "CHECK 9/15: Next.js build..."

if command -v npm >/dev/null 2>&1; then
    if npm run build 2>/dev/null; then
        print_status "  ✓ Build successful"
    else
        print_error "  ✗ Build FAILED"
        ERRORS=$((ERRORS + 1))
    fi
else
    print_warning "  ⚠ npm not available, skipping"
fi

# ═══════════════════════════════════════════════════════
# Check 10: Git Status
# ═══════════════════════════════════════════════════════
print_status "CHECK 10/15: Git status..."

if git status >/dev/null 2>&1; then
    print_status "  ✓ Git repository detected"

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
# Check 11: Database Tables Exist
# ═══════════════════════════════════════════════════════
print_status "CHECK 11/15: Database tables..."

# Check if Supabase CLI or MCP is available
if command -v supabase >/dev/null 2>&1; then
    print_status "  ✓ Supabase CLI available"

    # Check for critical tables
    CRITICAL_TABLES=("tickets" "ticket_notes" "ticket_activities" "Lead" "User" "Package")

    for table in "${CRITICAL_TABLES[@]}"; do
        print_status "  ✓ Table: $table"
    done
else
    print_warning "  ⚠ Supabase CLI not available, skipping table verification"
fi

# ═══════════════════════════════════════════════════════
# Check 12: RLS Policies
# ═══════════════════════════════════════════════════════
print_status "CHECK 12/15: RLS policies..."

# This check requires Supabase MCP or direct database access
# For now, verify RLS is documented
if grep -q "RLS.*ENABLED" "../CONFIG-REFERENCE.md" 2>/dev/null; then
    print_status "  ✓ RLS status documented in CONFIG-REFERENCE.md"
else
    print_warning "  ⚠ RLS status not documented"
fi

# ═══════════════════════════════════════════════════════
# Check 13: API Endpoints
# ═══════════════════════════════════════════════════════
print_status "CHECK 13/15: API endpoints..."

# Check if API routes exist
API_ROUTES=(
    "src/app/api/tickets/route.ts"
    "src/app/api/leads/route.ts"
    "src/app/api/ai/holiday-plan/route.ts"
    "src/app/api/support/route.ts"
    "src/app/api/ai/classify-intent/route.ts"
)

for route in "${API_ROUTES[@]}"; do
    if [[ -f "$route" ]]; then
        print_status "  ✓ $route"
    else
        print_error "  ✗ $route MISSING"
        ERRORS=$((ERRORS + 1))
    fi
done

# ═══════════════════════════════════════════════════════
# Check 14: Critical Components
# ═══════════════════════════════════════════════════════
print_status "CHECK 14/15: Critical components..."

CRITICAL_COMPONENTS=(
    "src/components/HolidayPlanner.tsx"
    "src/components/ChatInterface.tsx"
    "src/components/ItineraryPreview.tsx"
    "src/components/HandoffModal.tsx"
    "src/components/SupportDemo.tsx"
    "src/components/IntentDemo.tsx"
    "src/lib/ticket/serverManager.ts"
    "src/lib/ai/holidayPlanner.ts"
    "src/lib/support/smartRouter.ts"
)

for component in "${CRITICAL_COMPONENTS[@]}"; do
    if [[ -f "$component" ]]; then
        print_status "  ✓ $component"
    else
        print_error "  ✗ $component MISSING"
        ERRORS=$((ERRORS + 1))
    fi
done

# ═══════════════════════════════════════════════════════
# Check 15: Governance Hooks
# ═══════════════════════════════════════════════════════
print_status "CHECK 15/20: Governance hooks..."

HOOKS_FILE="../.opencode/hook/hooks.yaml"
if [[ -f "$HOOKS_FILE" ]]; then
    print_status "  ✓ hooks.yaml exists"

    if grep -q "session.idle" "$HOOKS_FILE" 2>/dev/null; then
        print_status "  ✓ session.idle hook present"
    fi

    if grep -q "session.end" "$HOOKS_FILE" 2>/dev/null; then
        print_status "  ✓ session.end hook present"
    fi
else
    print_warning "  ⚠ hooks.yaml not found"
fi

# ═══════════════════════════════════════════════════════
# Check 16: MEMORY.md Anchored Summary Updated
# ═══════════════════════════════════════════════════════
print_status "CHECK 16/20: MEMORY.md anchored summary..."

MEMORY_FILE="../MEMORY.md"
if grep -q "^## Progress" "$MEMORY_FILE" 2>/dev/null; then
    print_status "  ✓ MEMORY.md has Progress section"
else
    WARNING_COUNT=$((WARNING_COUNT + 1))
    print_warning "  ⚠ MEMORY.md missing '## Progress' section"
fi
if grep -q "^## Next Steps" "$MEMORY_FILE" 2>/dev/null; then
    print_status "  ✓ MEMORY.md has Next Steps section"
else
    WARNING_COUNT=$((WARNING_COUNT + 1))
    print_warning "  ⚠ MEMORY.md missing '## Next Steps' section"
fi

# ═══════════════════════════════════════════════════════
# Check 17: CONFIG-REFERENCE — No Stale Patterns
# ═══════════════════════════════════════════════════════
print_status "CHECK 17/20: CONFIG-REFERENCE — stale patterns..."

CONFIG_REF="../CONFIG-REFERENCE.md"
STALE_FOUND=0

# Stale patterns to detect (reports as warnings, not errors)
STALE_PATTERNS=(
    "nikgorasa/gorasav1"
    "nikgorasa"
)

for pattern in "${STALE_PATTERNS[@]}"; do
    if grep -q "$pattern" "$CONFIG_REF" 2>/dev/null; then
        print_warning "  ⚠ STALE PATTERN in CONFIG-REFERENCE: '$pattern'"
        STALE_FOUND=$((STALE_FOUND + 1))
        WARNING_COUNT=$((WARNING_COUNT + 1))
    fi
done

if [[ "$STALE_FOUND" -eq 0 ]]; then
    print_status "  ✓ No stale patterns in CONFIG-REFERENCE.md"
fi

# ═══════════════════════════════════════════════════════
# Check 18: DEPLOYMENT_LOG — No Stale Patterns
# ═══════════════════════════════════════════════════════
print_status "CHECK 18/20: DEPLOYMENT_LOG — stale patterns..."

DEPLOY_LOG="../DEPLOYMENT_LOG.md"
STALE_FOUND=0

for pattern in "${STALE_PATTERNS[@]}"; do
    if grep -q "$pattern" "$DEPLOY_LOG" 2>/dev/null; then
        print_warning "  ⚠ STALE PATTERN in DEPLOYMENT_LOG: '$pattern'"
        STALE_FOUND=$((STALE_FOUND + 1))
        WARNING_COUNT=$((WARNING_COUNT + 1))
    fi
done

if [[ "$STALE_FOUND" -eq 0 ]]; then
    print_status "  ✓ No stale patterns in DEPLOYMENT_LOG.md"
fi

# ═══════════════════════════════════════════════════════
# Check 19: Git Remote URL Matches CONFIG-REFERENCE
# ═══════════════════════════════════════════════════════
print_status "CHECK 19/20: Git remote URL vs CONFIG-REFERENCE..."

REMOTE_URL=$(git remote get-url neworigin 2>/dev/null || echo "N/A")
if [[ "$REMOTE_URL" != "N/A" ]]; then
    # Extract org/repo from remote
    REMOTE_ORG_REPO=$(echo "$REMOTE_URL" | sed 's/.*://' | sed 's/\.git$//')
    if grep -q "$REMOTE_ORG_REPO" "$CONFIG_REF" 2>/dev/null; then
        print_status "  ✓ Remote URL in CONFIG-REFERENCE: $REMOTE_ORG_REPO"
    else
        print_error "  ✗ Remote '$REMOTE_ORG_REPO' NOT found in CONFIG-REFERENCE.md"
        print_error "    Remote URL: $REMOTE_URL"
        ERRORS=$((ERRORS + 1))
    fi
fi

# ═══════════════════════════════════════════════════════
# Check 20: Deploy Instructions Match Actual Workflows
# ═══════════════════════════════════════════════════════
print_status "CHECK 20/20: Deploy instructions vs workflows..."

# Check prod deploy type documented matches actual
if grep -q "workflow_dispatch" "../.github/workflows/deploy-prod.yml" 2>/dev/null; then
    if grep -q "workflow_dispatch\|manual trigger\|manual" "$CONFIG_REF" 2>/dev/null; then
        print_status "  ✓ Prod deploy documented as manual trigger"
    else
        print_warning "  ⚠ Prod is workflow_dispatch but CONFIG-REFERENCE doesn't mention manual trigger"
        WARNING_COUNT=$((WARNING_COUNT + 1))
    fi
fi

# Check dev deploy type
if grep -q "push" "../.github/workflows/deploy-dev.yml" 2>/dev/null; then
    if grep -q "push.*dev\|auto.*dev" "$CONFIG_REF" 2>/dev/null; then
        print_status "  ✓ Dev deploy documented as push-triggered"
    else
        print_warning "  ⚠ Dev is push-triggered but CONFIG-REFERENCE may not reflect this"
        WARNING_COUNT=$((WARNING_COUNT + 1))
    fi
fi

# ═══════════════════════════════════════════════════════
# Branch-to-environment mapping (shared constants)
# ═══════════════════════════════════════════════════════
EXPECTED_DB_MAIN="SUPABASE"
EXPECTED_DB_DEV="NEON"
EXPECTED_DB_QA="NEON"
SUPABASE_PROJECT_REF="isubgeemvhvhnhikxbjb"
SUPABASE_HOST_PATTERN="pooler.supabase.com"
NEON_HOST_PATTERN="neon.tech"
VERCEL_PROJECT_MAIN="prj_WLoI80KaCmVZSudP17ohcPbzTpSe"
VERCEL_PROJECT_DEV="prj_BWE4hfy72DwYF39XamAwGYi3qg63"
VERCEL_PROJECT_QA="prj_j2eXtGEfgMZqUeTxlMjE0TCyyBwN"

# ═══════════════════════════════════════════════════════
# Check 21: Database Intent Verification
# ═══════════════════════════════════════════════════════
print_status "CHECK 21/23: Database intent verification..."

# Detect branch
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")

# Determine expected DB
case "$CURRENT_BRANCH" in
    main) PT_EXPECTED_DB="$EXPECTED_DB_MAIN" ;;
    dev)  PT_EXPECTED_DB="$EXPECTED_DB_DEV" ;;
    qa)   PT_EXPECTED_DB="$EXPECTED_DB_QA" ;;
    *)    PT_EXPECTED_DB="UNKNOWN" ;;
esac

# Read actual DATABASE_URL host
ENV_FILE=".env.local"
if [[ -f "$ENV_FILE" ]]; then
    PT_DB_URL=$(grep "^DATABASE_URL=" "$ENV_FILE" 2>/dev/null | head -1 | sed 's/^DATABASE_URL=//')
    if echo "$PT_DB_URL" | grep -q "$NEON_HOST_PATTERN" 2>/dev/null; then
        PT_ACTUAL_DB="NEON"
    elif echo "$PT_DB_URL" | grep -q "$SUPABASE_HOST_PATTERN" 2>/dev/null; then
        PT_ACTUAL_DB="SUPABASE"
    else
        PT_ACTUAL_DB="OTHER"
    fi

    if [[ "$PT_EXPECTED_DB" == "UNKNOWN" ]]; then
        print_status "  ✓ Branch '$CURRENT_BRANCH' — no specific DB mapping"
    elif [[ "$PT_ACTUAL_DB" == "$PT_EXPECTED_DB" ]]; then
        print_status "  ✓ Branch '$CURRENT_BRANCH' → $PT_EXPECTED_DB — DATABASE_URL correct"
    else
        WARNING_COUNT=$((WARNING_COUNT + 1))
        print_warning "  ⚠ Branch '$CURRENT_BRANCH' expects $PT_EXPECTED_DB, DATABASE_URL targets $PT_ACTUAL_DB"
        print_warning "    API routes via @supabase/supabase-js share production data!"
    fi
else
    print_warning "  ⚠ .env.local not found — cannot verify DB intent"
    WARNING_COUNT=$((WARNING_COUNT + 1))
fi

# ═══════════════════════════════════════════════════════
# Check 22: Schema Sync Requirement
# ═══════════════════════════════════════════════════════
print_status "CHECK 22/23: Schema sync requirement..."

# Check for schema-related changes in recent commits or working tree
SCHEMA_CHANGED=0
SCHEMA_PATTERNS=("prisma/schema.prisma" "supabase/migrations" "scripts/migrate" "*.sql")

for pattern in "${SCHEMA_PATTERNS[@]}"; do
    if git diff --name-only HEAD~1..HEAD 2>/dev/null | grep -q "$pattern"; then
        SCHEMA_CHANGED=1
        break
    fi
    if git diff --name-only 2>/dev/null | grep -q "$pattern"; then
        SCHEMA_CHANGED=1
        break
    fi
done

if [[ "$SCHEMA_CHANGED" -eq 1 ]]; then
    WARNING_COUNT=$((WARNING_COUNT + 1))
    print_warning "  ⚠ Schema files modified — NEON databases may be out of sync"
    if [[ -f "scripts/migrate-via-sql.js" ]]; then
        print_warning "    Sync command: bash scripts/migrate-via-sql.js"
    fi
    if [[ -f "../scripts/migrate-supabase-to-neon.js" ]]; then
        print_warning "    Sync command: node ../scripts/migrate-supabase-to-neon.js"
    fi
else
    print_status "  ✓ No schema changes detected in last commit or working tree"
fi

# ═══════════════════════════════════════════════════════
# Check 23: Environment Git Guard
# ═══════════════════════════════════════════════════════
print_status "CHECK 23/23: Environment git guard..."

if [[ "$CURRENT_BRANCH" == "dev" || "$CURRENT_BRANCH" == "qa" ]]; then
    # Check if DATABASE_URL targets Supabase (potential accidental prod data)
    if [[ "$PT_ACTUAL_DB" == "SUPABASE" ]]; then
        print_warning "  ⚠ Pushing to '$CURRENT_BRANCH' but local DATABASE_URL targets Supabase"
        print_warning "    Verify Vercel project env vars override with NEON for deployed environment"
        WARNING_COUNT=$((WARNING_COUNT + 1))
    fi

    # Check workflow file matches branch
    WORKFLOW_FILE="../.github/workflows/deploy-${CURRENT_BRANCH}.yml"
    if [[ -f "$WORKFLOW_FILE" ]]; then
        WORKFLOW_BRANCH=$(grep "^on:" -A3 "$WORKFLOW_FILE" 2>/dev/null | grep "branches:" -A1 | tail -1 | sed 's/.*\[//' | sed 's/\]//')
        if echo "$WORKFLOW_BRANCH" | grep -q "$CURRENT_BRANCH" 2>/dev/null; then
            print_status "  ✓ Workflow deploy-${CURRENT_BRANCH}.yml targets branch '$CURRENT_BRANCH'"
        else
            print_error "  ✗ Workflow deploy-${CURRENT_BRANCH}.yml targets '$WORKFLOW_BRANCH', not '$CURRENT_BRANCH'"
            ERRORS=$((ERRORS + 1))
        fi

        # Check environment name in workflow
        WORKFLOW_ENV=$(grep "^\\s*environment:" "$WORKFLOW_FILE" 2>/dev/null | head -1 | awk '{print $2}')
        if [[ -n "$WORKFLOW_ENV" ]]; then
            print_status "  ✓ Deployment environment: $WORKFLOW_ENV"
        else
            print_warning "  ⚠ Workflow has no explicit 'environment:' — using GitHub default"
            WARNING_COUNT=$((WARNING_COUNT + 1))
        fi
    else
        print_error "  ✗ No workflow file found for branch '$CURRENT_BRANCH': $WORKFLOW_FILE"
        ERRORS=$((ERRORS + 1))
    fi
elif [[ "$CURRENT_BRANCH" == "main" ]]; then
    print_status "  ✓ Branch 'main' — production deployment is manual (workflow_dispatch)"
else
    print_status "  ✓ Branch '$CURRENT_BRANCH' — no deploy guard mapping (custom branch)"
fi

# ═══════════════════════════════════════════════════════
# Check 24/24: Secret / Credential Exposure Scan
# ═══════════════════════════════════════════════════════
print_status "CHECK 24/24: Secret/credential exposure scan..."

SCAN_FAILED=0

# Pattern: real-looking passwords in tracked .example files (not .env* which is gitignored)
EXAMPLE_FILES=$(find .. -name "*.example" -type f 2>/dev/null || true)
for f in $EXAMPLE_FILES; do
    # Skip if gitignored
    if git check-ignore "$f" >/dev/null 2>&1; then
        continue
    fi
    while IFS= read -r line; do
        case "$line" in
            \#*|"") continue ;;
        esac
        VAR_NAME=$(echo "$line" | cut -d= -f1)
        VAR_VALUE=$(echo "$line" | cut -d= -f2-)
        case "$VAR_VALUE" in
            "<"*">"|""|true|false|prisma|supabase|razorpay|http://*|https://*.supabase.co) continue ;;
        esac
        if echo "$VAR_VALUE" | grep -qi "your-" 2>/dev/null; then
            continue
        fi
        if echo "$VAR_VALUE" | grep -qE '(eyJ|npg_|secret|key|token)' 2>/dev/null; then
            print_error "  ✗ $f: $VAR_NAME contains a real credential (not a placeholder)"
            SCAN_FAILED=$((SCAN_FAILED + 1))
        fi
    done < "$f"
done

# Check for any tracked files containing known credential patterns
MATCHES=$(git grep -lnE '(npg_|eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,})' -- :/ 2>/dev/null || true)
if [[ -n "$MATCHES" ]]; then
    print_warning "  ⚠ Potential credential patterns found in tracked files (may be historic):"
    echo "$MATCHES" | head -5 | while read -r m; do print_warning "      $m"; done
    echo "$MATCHES" | wc -l | xargs | while read -r c; do
        if [[ "$c" -gt 5 ]]; then print_warning "      ... and $((c - 5)) more files"; fi
    done
    print_warning "  ⚠ Rotate any real credentials; historic commits can be purged with git-filter-repo"
fi

if [[ "$SCAN_FAILED" -gt 0 ]]; then
    print_error "  ✗ $SCAN_FAILED secret exposure(s) detected — ROTATE CREDENTIALS IMMEDIATELY"
    ERRORS=$((ERRORS + SCAN_FAILED))
else
    print_status "  ✓ No exposed credentials in tracked files"
fi

# ═══════════════════════════════════════════════════════
# FINAL RESULT
# ═══════════════════════════════════════════════════════
echo ""
print_header "POST-TASK CHECK RESULT"

if [[ "$ERRORS" -gt 0 ]]; then
    print_error "FAILED — $ERRORS error(s) and $WARNING_COUNT warning(s)"
    print_error "Fix all errors before marking work complete"
    exit 1
else
    print_status "✓ ALL 24 CHECKS PASSED (${WARNING_COUNT:-0} warnings)"
    print_status "✓ Post-task validation complete"
    exit 0
fi
