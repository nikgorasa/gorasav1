#!/bin/bash
# branch-protection-guard.sh — Prevents accidental removal of branch protection
# This script is called by pre-push hook and governance hooks
# NEVER bypass this guard. If you need to modify protection, do it via PR.

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROTECTED_BRANCHES="main qa"
REPO="Gorasa-In-2026/gorasav1"

check_branch_protection() {
  local branch="$1"
  
  # Check if branch exists on remote
  if ! git ls-remote --exit-code "neworigin" "$branch" >/dev/null 2>&1; then
    return 0  # Branch doesn't exist remotely, skip check
  fi
  
  # Check if branch is protected via GitHub API
  local protection_status
  protection_status=$(gh api "repos/$REPO/branches/$branch/protection" 2>/dev/null | jq -r '.required_pull_request_reviews.required_approving_review_count // 0' 2>/dev/null || echo "0")
  
  if [[ "$protection_status" == "0" ]]; then
    echo -e "${RED}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  BRANCH PROTECTION VIOLATION                            ║${NC}"
    echo -e "${RED}╠══════════════════════════════════════════════════════════╣${NC}"
    echo -e "${RED}║  Branch '$branch' has NO protection!                    ║${NC}"
    echo -e "${RED}║                                                          ║${NC}"
    echo -e "${RED}║  All protected branches (main, qa) MUST have:           ║${NC}"
    echo -e "${RED}║    - required_approving_review_count >= 1                ║${NC}"
    echo -e "${RED}║                                                          ║${NC}"
    echo -e "${RED}║  To fix: Re-enable protection via GitHub Settings        ║${NC}"
    echo -e "${RED}║  or run: bash scripts/restore-protection.sh              ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════╝${NC}"
    return 1
  fi
  
  return 0
}

# Main execution
if [[ "${1}" == "--check-all" ]]; then
  echo "Checking branch protection for all protected branches..."
  FAILED=0
  for branch in $PROTECTED_BRANCHES; do
    if ! check_branch_protection "$branch"; then
      FAILED=1
    fi
  done
  if [[ $FAILED -eq 0 ]]; then
    echo -e "${GREEN}✓ All protected branches have protection enabled${NC}"
  fi
  exit $FAILED
elif [[ -n "$1" ]]; then
  check_branch_protection "$1"
else
  # Check current branch
  CURRENT=$(git branch --show-current 2>/dev/null || echo "unknown")
  for branch in $PROTECTED_BRANCHES; do
    if [[ "$CURRENT" == "$branch" ]]; then
      check_branch_protection "$branch"
    fi
  done
fi
