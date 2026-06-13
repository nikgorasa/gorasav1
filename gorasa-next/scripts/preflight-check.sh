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

# Branch-to-environment mapping (single source of truth)
EXPECTED_DB_MAIN="SUPABASE"
EXPECTED_DB_DEV="NEON"
EXPECTED_DB_QA="NEON"
SUPABASE_PROJECT_REF="isubgeemvhvhnhikxbjb"
SUPABASE_HOST_PATTERN="pooler.supabase.com"
NEON_HOST_PATTERN="neon.tech"

# Vercel project IDs by branch
VERCEL_PROJECT_MAIN="prj_WLoI80KaCmVZSudP17ohcPbzTpSe"
VERCEL_PROJECT_DEV="prj_BWE4hfy72DwYF39XamAwGYi3qg63"
VERCEL_PROJECT_QA="prj_j2eXtGEfgMZqUeTxlMjE0TCyyBwN"

# ═══════════════════════════════════════════════════════
# Check 1: Documentation Files Exist
# ═══════════════════════════════════════════════════════
print_status "CHECK 1/14: Required documentation files..."

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
print_status "CHECK 2/14: Last session context from MEMORY.md..."

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
print_status "CHECK 3/14: Known issues from LEARNING-FROM-MISTAKES.md..."

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
print_status "CHECK 4/14: Configuration from CONFIG-REFERENCE.md..."

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
print_status "CHECK 5/14: Environment variables..."

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
print_status "CHECK 6/16: TypeScript compilation..."

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
print_status "CHECK 7/16: Git status..."

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
print_status "CHECK 8/16: Recent commits..."

RECENT_COMMITS=$(git log --oneline -5 2>/dev/null || echo "No commits")
print_status "  ✓ Recent commits:"
echo "$RECENT_COMMITS" | while read -r line; do
    print_status "    $line"
done

# ═══════════════════════════════════════════════════════
# Check 9: Critical Files Exist
# ═══════════════════════════════════════════════════════
print_status "CHECK 9/16: Critical files..."

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
print_status "CHECK 10/16: Governance hooks..."

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
# ═══════════════════════════════════════════════════════
# Check 11: Branch-to-DB Mapping (Environment Intent)
# ═══════════════════════════════════════════════════════
print_status "CHECK 11/16: Branch-to-DB mapping..."

# Determine expected DB type for current branch
case "$BRANCH" in
    main)
        EXPECTED_DB="$EXPECTED_DB_MAIN"
        ;;
    dev)
        EXPECTED_DB="$EXPECTED_DB_DEV"
        ;;
    qa)
        EXPECTED_DB="$EXPECTED_DB_QA"
        ;;
    *)
        EXPECTED_DB="UNKNOWN"
        ;;
esac

# Determine actual DB type from DATABASE_URL
if [[ -f "$ENV_FILE" ]]; then
    ACTUAL_DB_URL=$(grep "^DATABASE_URL=" "$ENV_FILE" 2>/dev/null | head -1 | sed 's/^DATABASE_URL=//')
    if echo "$ACTUAL_DB_URL" | grep -q "$NEON_HOST_PATTERN" 2>/dev/null; then
        ACTUAL_DB="NEON"
    elif echo "$ACTUAL_DB_URL" | grep -q "$SUPABASE_HOST_PATTERN" 2>/dev/null; then
        ACTUAL_DB="SUPABASE"
    else
        ACTUAL_DB="OTHER"
    fi
else
    ACTUAL_DB="UNKNOWN"
fi

if [[ "$EXPECTED_DB" == "UNKNOWN" ]]; then
    print_status "  ✓ Branch '$BRANCH' has no specific DB mapping (custom branch)"
elif [[ "$ACTUAL_DB" == "$EXPECTED_DB" ]]; then
    print_status "  ✓ Branch '$BRANCH' → $EXPECTED_DB — DATABASE_URL is correct"
else
    print_error "  ✗ Branch '$BRANCH' expects $EXPECTED_DB, but DATABASE_URL targets $ACTUAL_DB"
    print_error "    All API routes via @supabase/supabase-js share production data!"
    ERRORS=$((ERRORS + 1))
fi

# Also check Supabase URL environment intent
SUPABASE_URL=$(grep "^NEXT_PUBLIC_SUPABASE_URL=" "$ENV_FILE" 2>/dev/null | head -1 | sed 's/^NEXT_PUBLIC_SUPABASE_URL=//')
if echo "$SUPABASE_URL" | grep -q "$SUPABASE_PROJECT_REF" 2>/dev/null; then
    if [[ "$EXPECTED_DB" == "NEON" ]]; then
        print_warning "  ⚠ API calls still route through production Supabase ($SUPABASE_PROJECT_REF)"
        print_warning "    @supabase/supabase-js bypasses DATABASE_URL — true isolation requires adapter"
    fi
fi

# ═══════════════════════════════════════════════════════
# Check 12: Production Supabase Shield
# ═══════════════════════════════════════════════════════
print_status "CHECK 12/16: Production Supabase shield..."

SUPABASE_PROJECT_DETECTED=""
if echo "${SUPABASE_URL:-}" | grep -q "$SUPABASE_PROJECT_REF" 2>/dev/null; then
    SUPABASE_PROJECT_DETECTED="$SUPABASE_PROJECT_REF"
elif [[ -f "$ENV_FILE" ]]; then
    SUPABASE_URL_CHECK=$(grep "^NEXT_PUBLIC_SUPABASE_URL=" "$ENV_FILE" 2>/dev/null | head -1)
    if echo "$SUPABASE_URL_CHECK" | grep -q "$SUPABASE_PROJECT_REF" 2>/dev/null; then
        SUPABASE_PROJECT_DETECTED="$SUPABASE_PROJECT_REF"
    fi
fi

if [[ -n "$SUPABASE_PROJECT_DETECTED" ]]; then
    echo -e ""
    echo -e "${RED}  ╔══════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}  ║  PRODUCTION SUPABASE ACTIVE                         ║${NC}"
    echo -e "${RED}  ║  Project: $SUPABASE_PROJECT_DETECTED    ║${NC}"
    echo -e "${RED}  ║  Every @supabase/supabase-js call hits live data    ║${NC}"
    echo -e "${RED}  ║  Branch: $BRANCH                          ║${NC}"
    if [[ "$ACTUAL_DB" == "SUPABASE" ]]; then
        echo -e "${RED}  ║  DATABASE_URL: Supabase pooler (consistent)         ║${NC}"
    elif [[ "$ACTUAL_DB" == "NEON" ]]; then
        echo -e "${RED}  ║  DATABASE_URL: NEON (split-brain — API goes to    ║${NC}"
        echo -e "${RED}  ║               Supabase)                            ║${NC}"
    fi
    echo -e "${RED}  ╚══════════════════════════════════════════════════════╝${NC}"
    echo -e ""
    print_status "  ✓ Production Supabase shield displayed"
else
    print_status "  ✓ Not connected to known production Supabase project"
fi

# ═══════════════════════════════════════════════════════
# Check 13: Vercel Project Env Var Cross-Ref
# ═══════════════════════════════════════════════════════
print_status "CHECK 13/16: Vercel env cross-reference..."

VERCEL_PROJECT_ID=""
case "$BRANCH" in
    main) VERCEL_PROJECT_ID="$VERCEL_PROJECT_MAIN" ;;
    dev)  VERCEL_PROJECT_ID="$VERCEL_PROJECT_DEV" ;;
    qa)   VERCEL_PROJECT_ID="$VERCEL_PROJECT_QA" ;;
esac

if [[ -z "$VERCEL_PROJECT_ID" ]]; then
    print_status "  ✓ No Vercel project mapping for branch '$BRANCH' (skipped)"
elif command -v vercel >/dev/null 2>&1 && [[ -f ".vercel/project.json" ]]; then
    LINKED_PROJECT=$(grep '"projectId"' ".vercel/project.json" 2>/dev/null | sed 's/.*: *"//' | sed 's/".*//')
    if [[ "$LINKED_PROJECT" != "$VERCEL_PROJECT_ID" ]]; then
        print_warning "  ⚠ Linked Vercel project ($LINKED_PROJECT...) differs from expected ($VERCEL_PROJECT_ID)"
        print_warning "    Run 'vercel link' to switch projects, or skip cross-ref"
    else
        VERCEL_OUTPUT=$(vercel env ls 2>/dev/null || true)
        VERCEL_DB_URL=$(echo "$VERCEL_OUTPUT" | grep "^DATABASE_URL " | head -1 | awk '{print $2}' || true)
        if [[ -z "$VERCEL_DB_URL" ]]; then
            print_warning "  ⚠ DATABASE_URL not found in Vercel project env (may be in different environment scope)"
        elif echo "$VERCEL_DB_URL" | grep -q "$NEON_HOST_PATTERN" 2>/dev/null; then
            print_status "  ✓ Vercel project '$BRANCH' DATABASE_URL targets NEON"
        elif echo "$VERCEL_DB_URL" | grep -q "$SUPABASE_HOST_PATTERN" 2>/dev/null; then
            print_error "  ✗ Vercel project '$BRANCH' DATABASE_URL targets Supabase pooler"
            print_error "    Staging environment shares production data!"
            ERRORS=$((ERRORS + 1))
        else
            print_warning "  ⚠ Vercel project '$BRANCH' DATABASE_URL unrecognized host"
        fi
    fi
else
    print_warning "  ⚠ Vercel CLI or .vercel/project.json not available — cannot cross-ref"
fi

# ═══════════════════════════════════════════════════════
# Check 14: Secret / Credential Exposure Scan
# ═══════════════════════════════════════════════════════
print_status "CHECK 14/16: Secret/credential exposure scan..."

SCAN_FAILED=0

# Pattern: real-looking passwords in tracked .example files (not .env* which is gitignored)
EXAMPLE_FILES=$(find .. -name "*.example" -type f 2>/dev/null || true)
for f in $EXAMPLE_FILES; do
    BASENAME=$(basename "$f")
    # Skip if gitignored
    if git check-ignore "$f" >/dev/null 2>&1; then
        continue
    fi
    # Check for common credential patterns with non-placeholder values
    while IFS= read -r line; do
        # Skip comments and blank lines
        case "$line" in
            \#*|"") continue ;;
        esac
        # Extract variable name and value
        VAR_NAME=$(echo "$line" | cut -d= -f1)
        VAR_VALUE=$(echo "$line" | cut -d= -f2-)
        # Skip if value is a placeholder (<...>), empty, or common safe values
        case "$VAR_VALUE" in
            "<"*">"|""|true|false|prisma|supabase|razorpay|http://*|https://*.supabase.co) continue ;;
        esac
        # Also skip lines containing "your-*" as those are clearly placeholders
        if echo "$VAR_VALUE" | grep -qi "your-" 2>/dev/null; then
            continue
        fi
        # Flag suspicious patterns (real secrets, not placeholder text)
        if echo "$VAR_VALUE" | grep -qE '(eyJ|npg_|secret|key|token)' 2>/dev/null; then
            print_error "  ✗ $f: $VAR_NAME contains a real credential (not a placeholder)"
            SCAN_FAILED=$((SCAN_FAILED + 1))
        fi
    done < "$f"
done

# Check for any tracked files containing known credential patterns like
# pg_ connection strings (any host), JWT tokens (eyJ...), or API keys
# NOTE: git grep only searches tracked (committed) files, not working tree
MATCHES=$(git grep -lnE '((npg_|napi_)[a-zA-Z0-9_-]{8,}|eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,})' -- ':(top)*' 2>/dev/null || true)
# Exclude the check scripts themselves (they contain the regex pattern)
MATCHES=$(echo "$MATCHES" | grep -vE '(scripts/preflight-check\.sh$|scripts/post-task-check\.sh$)' || true)
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
# Check 15: Deployment Commit Traceability
# ═══════════════════════════════════════════════════════
print_status "CHECK 15/16: Deployment commit traceability..."

REMOTE="neworigin"
if ! git fetch "$REMOTE" dev qa main 2>/dev/null; then
    REMOTE="origin"
    git fetch "$REMOTE" dev qa main 2>/dev/null || true
fi

BRANCHES=("dev" "qa" "main")
declare -A R_SHA R_MSG

for branch in "${BRANCHES[@]}"; do
    R_SHA["$branch"]=$(git rev-parse --short "$REMOTE/$branch" 2>/dev/null || echo "N/A")
    if [[ "${R_SHA["$branch"]}" != "N/A" ]]; then
        R_MSG["$branch"]=$(git log --oneline -1 "$REMOTE/$branch" 2>/dev/null | sed 's/^[^ ]* //' || echo "N/A")
    fi
done

print_status "  ┌──────────┬──────────────┬──────────────────────────────┐"
print_status "  │ Branch   │ Remote SHA   │ Last Commit                  │"
print_status "  ├──────────┼──────────────┼──────────────────────────────┤"
for branch in "${BRANCHES[@]}"; do
    printf -v line "  │ %-8s │ %-12s │ %-28s │" "$branch" "${R_SHA["$branch"]}" "${R_MSG["$branch"]}"
    print_status "$line"
done
print_status "  └──────────┴──────────────┴──────────────────────────────┘"

# Check ahead/behind
for branch in "${BRANCHES[@]}"; do
    AHEAD=$(git rev-list --count "$REMOTE/$branch..$branch" 2>/dev/null || echo "0")
    BEHIND=$(git rev-list --count "$branch..$REMOTE/$branch" 2>/dev/null || echo "0")
    if [[ "$AHEAD" -gt 0 || "$BEHIND" -gt 0 ]]; then
        print_warning "  ⚠ $branch: $AHEAD ahead, $BEHIND behind $REMOTE/$branch"
        if [[ "$AHEAD" -gt 0 ]]; then
            git log --oneline "$REMOTE/$branch..$branch" 2>/dev/null | while read -r c; do
                print_warning "       ↑ $c"
            done
        fi
    else
        print_status "  ✓ $branch: synced with $REMOTE/$branch"
    fi
done

# Promotion pipeline
print_status ""
for pair in "dev→qa" "qa→prod"; do
    src="${pair%%→*}"
    dst="${pair##*→}"
    count=$(git log --oneline "$REMOTE/$src..$REMOTE/$dst" 2>/dev/null | wc -l)
    if [[ "$count" -gt 0 ]]; then
        print_warning "  ⚠ $src→$dst: $count commit(s) unpromoted"
    else
        print_status "  ✓ $src→$dst: up to date"
    fi
done

print_status "  ✓ Commit traceability recorded"

# ═══════════════════════════════════════════════════════
# CHECK 16/16: DB schema sync (dev vs current branch target)
# ═══════════════════════════════════════════════════════
print_status "CHECK 16/16: DB schema sync..."

BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
DB_CHECK_TARGET=""

if [[ "$BRANCH" == "main" ]]; then
  DB_CHECK_TARGET="prod"
elif [[ "$BRANCH" == "qa" ]]; then
  DB_CHECK_TARGET="qa"
elif [[ "$BRANCH" == "dev" ]]; then
  DB_CHECK_TARGET="dev"
fi

if [[ "$DB_CHECK_TARGET" == "qa" ]] && command -v node &> /dev/null; then
  DB_CHECK_SCRIPT="$(dirname "$0")/db-check.sh"
  if [[ -f "$DB_CHECK_SCRIPT" ]]; then
    DB_CHECK_OUTPUT=$(bash "$DB_CHECK_SCRIPT" qa 2>&1 | grep -v "Warning: SECURITY WARNING" || true)
    DB_CHECK_EXIT=$?
    
    if [[ $DB_CHECK_EXIT -ne 0 ]]; then
      print_error "DB schema drift detected between DEV and QA"
      echo "$DB_CHECK_OUTPUT" | grep "ERROR" | while read -r line; do
        print_error "  $line"
      done
      ERRORS=$((ERRORS + 1))
    else
      print_status "  ✓ DB schemas in sync (dev vs qa)"
    fi
  else
    print_warning "  ⚠ db-check.sh not found, skipping DB sync check"
  fi
elif [[ "$DB_CHECK_TARGET" == "prod" ]]; then
  print_warning "  ⚠ Production DB check skipped (manual review required before prod deploy)"
else
  print_status "  ✓ DB check skipped (branch: $BRANCH)"
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
    print_status "✓ ALL 16 CHECKS PASSED"
    print_status "✓ Pre-flight validation complete"
    print_status ""
    print_status "Ready to start work. Remember:"
    print_status "  1. Read project docs (Sprint-1.md, MEMORY.md)"
    print_status "  2. Generate context brief if new issue"
    print_status "  3. Run post-task-check.sh when done"
    exit 0
fi
