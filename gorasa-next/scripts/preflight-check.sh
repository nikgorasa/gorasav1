#!/bin/bash

# GoRASA Pre-Flight Check Script
# Must be run before starting ANY significant work

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function to print colored output
print_status() {
    echo -e "${GREEN}[PRE-FLIGHT]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Change to project root
cd "$(dirname "$0")/.."

print_status "Starting GoRASA pre-flight checks..."

# Check 1: Read project documentation
print_status "1. Checking project documentation..."

REQUIRED_DOCS=(
    "../Sprint-1.md"
    "../LEARNING-FROM-MISTAKES.md"
    "../CONFIG-REFERENCE.md"
    "../DEPLOYMENT_LOG.md"
    "../MEMORY.md"
    "../CHANGE-LOG.md"
)

MISSING_DOCS=()

for doc in "${REQUIRED_DOCS[@]}"; do
    if [[ ! -f "$doc" ]]; then
        MISSING_DOCS+=("$doc")
        print_warning "Missing documentation: $doc"
    fi
done

if [[ ${#MISSING_DOCS[@]} -gt 0 ]]; then
    print_error "Missing required documentation files: ${MISSING_DOCS[*]}"
    print_error "Run: cat ../Sprint-1.md ../LEARNING-FROM-MISTAKES.md ../CONFIG-REFERENCE.md ../DEPLOYMENT_LOG.md ../MEMORY.md ../CHANGE-LOG.md"
    exit 1
fi

print_status "✓ All required documentation files exist"

# Check 2: Generate context brief
print_status "2. Checking for context brief..."

CONTEXT_BRIEF_FILES=("../CONTEXT-BRIEF-*.md")

if ls "../CONTEXT-BRIEF-*.md" 1> /dev/null 2>&1; then
    print_warning "Found existing context brief files:"
    ls "../CONTEXT-BRIEF-*.md"
else
    print_warning "No context brief found. Create one with:
    touch ../CONTEXT-BRIEF-[ISSUE-NAME].md
    Then populate with:
    - Problem statement
    - Investigation summary
    - Root cause analysis
    - Resolution path
    - Lessons learned
    - Action items"
fi

# Check 3: Check current state
print_status "3. Checking current project state..."

if ! git status >/dev/null 2>&1; then
    print_error "Not in a git repository or git not available"
    exit 1
fi

print_status "✓ Git status available"

# Check recent commits
RECENT_COMMITS=$(git log --oneline -5 2>/dev/null || echo "0 commits")
print_status "Recent commits:"
print_status "$RECENT_COMMITS"

# Check TypeScript compilation
print_status "4. Checking TypeScript compilation..."

if command -v npx >/dev/null 2>&1; then
    if npx tsc --noEmit 2>&1; then
        print_status "✓ TypeScript compilation successful"
    else
        print_error "TypeScript compilation failed"
        print_error "Fix TypeScript errors before proceeding"
        exit 1
    fi
else
    print_warning "npx not available, skipping TypeScript check"
fi

# Final validation
print_status "5. Final validation..."

# Check for governance scripts
if [[ -f "scripts/preflight-check.sh" ]]; then
    print_status "✓ Preflight check script exists"
else
    print_error "Preflight check script not found: scripts/preflight-check.sh"
    exit 1
fi

if [[ -f "scripts/post-task-check.sh" ]]; then
    print_status "✓ Post-task check script exists"
else
    print_error "Post-task check script not found: scripts/post-task-check.sh"
    exit 1
fi

# Check opencode hooks
HOOKS_FILE="../.opencode/hook/hooks.yaml"
if [[ -f "$HOOKS_FILE" ]]; then
    print_status "✓ Opencode hooks configuration exists"
else
    print_warning "Opencode hooks configuration not found at $HOOKS_FILE"
fi

print_status "6. Summary..."
print_status "Pre-flight checks completed successfully!"
print_status ""
print_status "Next steps:"
print_status "1. Complete your task"
print_status "2. Run: bash scripts/post-task-check.sh"
print_status ""
print_status "Remember: This is MANDATORY for ALL work on the GoRASA project."

exit 0
