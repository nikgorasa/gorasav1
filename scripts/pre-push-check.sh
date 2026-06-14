#!/bin/bash

# Pre-Push Guardrail — prevents accidental direct pushes to main
# Run this before ANY git push to verify you're on the right branch

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

print_ok() { echo -e "${GREEN}[OK]${NC} $1"; }
print_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
print_error() { echo -e "${RED}[BLOCKED]${NC} $1"; }
print_header() { echo -e "${CYAN}════════════════════════════════════════════════════${NC}"; echo -e "${CYAN}  $1${NC}"; echo -e "${CYAN}════════════════════════════════════════════════════${NC}"; }

print_header "Pre-Push Guardrail"
echo ""

# Show deployment pipeline
if [[ -f "DEPLOY.md" ]]; then
    echo -e "  ${CYAN}Deployment Pipeline:${NC}"
    echo -e "    dev  → git push origin dev  → auto-deploy"
    echo -e "    qa   → PR merge → auto-deploy"
    echo -e "    main → PR merge → auto-deploy"
    echo ""
fi

BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
REMOTE=$(git remote get-url origin 2>/dev/null || echo "none")
ERRORS=0

# Check 1: Verify remote is correct
print_ok "Remote origin: $REMOTE"
if [[ "$REMOTE" != *"Gorasa-In-2026/gorasav1.git" ]]; then
    print_warn "Remote is not gorasav1 — verify this is intentional"
fi

# Check 2: Branch-specific rules
if [[ "$BRANCH" == "main" ]]; then
    print_error "You are on main branch!"
    print_error "Production deploys via PR merge, not direct push."
    print_error ""
    print_error "Correct flow:"
    print_error "  1. Work on dev branch"
    print_error "  2. Push to dev: git push origin dev"
    print_error "  3. Create PR: dev → main"
    print_error "  4. Merge PR → auto-deploys to production"
    print_error ""
    print_error "If you MUST push to main, use: git push origin main --no-verify"
    ERRORS=$((ERRORS + 1))
elif [[ "$BRANCH" == "dev" ]]; then
    print_ok "Branch: dev (auto-deploys to development)"
elif [[ "$BRANCH" == "qa" ]]; then
    print_ok "Branch: qa (auto-deploys to QA)"
else
    print_ok "Branch: $BRANCH (feature branch — safe to push)"
fi

# Check 3: Uncommitted changes
UNCOMMITTED=$(git status --porcelain 2>/dev/null | wc -l)
if [[ "$UNCOMMITTED" -gt 0 ]]; then
    print_warn "$UNCOMMITTED uncommitted changes — commit before pushing"
fi

echo ""
if [[ "$ERRORS" -gt 0 ]]; then
    print_error "Push blocked — fix errors above"
    exit 1
else
    print_ok "Pre-push check passed — safe to push"
    exit 0
fi
