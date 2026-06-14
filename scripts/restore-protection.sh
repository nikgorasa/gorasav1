#!/bin/bash
# restore-protection.sh — Re-enables branch protection for main and qa
# Run this if branch protection was accidentally removed

set -e

REPO="Gorasa-In-2026/gorasav1"
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

restore_protection() {
  local branch="$1"
  echo "Restoring protection for $branch..."
  
  gh api "repos/$REPO/branches/$branch/protection" \
    --method PUT \
    --input - << 'EOF'
{
  "required_status_checks": null,
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1
  },
  "restrictions": null
}
EOF
  
  echo -e "${GREEN}✓ $branch protection restored (1 review required)${NC}"
}

echo "═══ Branch Protection Restore ═══"
restore_protection "main"
restore_protection "qa"
echo ""
echo -e "${GREEN}✓ All branch protections restored${NC}"
