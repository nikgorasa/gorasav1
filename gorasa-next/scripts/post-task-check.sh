#!/bin/bash

# GoRASA Governance Post-Task Check
# Run this after completing any significant work

set -e

echo "========================================="
echo "GoRASA Governance Post-Task Check"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    echo -e "${RED}ERROR: Not in gorasa-next directory${NC}"
    echo "Please run from: /home/nikhil/Downloads/Gorasa/App-1/rasa-zero-app-main/gorasa-next"
    exit 1
fi

echo -e "${YELLOW}Step 1: Checking what was changed...${NC}"

# Check git status
CHANGED_FILES=$(git status --short | wc -l)
if [ "$CHANGED_FILES" -gt 0 ]; then
    echo -e "${GREEN}✓ $CHANGED_FILES file(s) changed${NC}"
    git status --short
else
    echo -e "${YELLOW}⚠ No files changed${NC}"
fi

echo ""
echo -e "${YELLOW}Step 2: Checking if learning log needs update...${NC}"

# Check if LEARNING-FROM-MISTAKES.md was recently modified
LEARNING_LOG="../LEARNING-FROM-MISTAKES.md"
if [ -f "$LEARNING_LOG" ]; then
    LAST_MODIFIED=$(stat -c %Y "$LEARNING_LOG" 2>/dev/null || stat -f %m "$LEARNING_LOG" 2>/dev/null)
    CURRENT_TIME=$(date +%s)
    HOURS_SINCE_MODIFICATION=$(( (CURRENT_TIME - LAST_MODIFIED) / 3600 ))
    
    if [ "$HOURS_SINCE_MODIFICATION" -lt 24 ]; then
        echo -e "${GREEN}✓ Learning log updated recently ($HOURS_SINCE_MODIFICATION hours ago)${NC}"
    else
        echo -e "${YELLOW}⚠ Learning log not updated in $HOURS_SINCE_MODIFICATION hours${NC}"
        echo "Did you debug something for >30 minutes? If yes, update LEARNING-FROM-MISTAKES.md"
    fi
else
    echo -e "${RED}✗ Learning log not found${NC}"
fi

echo ""
echo -e "${YELLOW}Step 3: Checking if deployment log needs update...${NC}"

# Check if deployment changed
DEPLOYMENT_LOG="../DEPLOYMENT_LOG.md"
if [ -f "$DEPLOYMENT_LOG" ]; then
    LAST_MODIFIED=$(stat -c %Y "$DEPLOYMENT_LOG" 2>/dev/null || stat -f %m "$DEPLOYMENT_LOG" 2>/dev/null)
    CURRENT_TIME=$(date +%s)
    HOURS_SINCE_MODIFICATION=$(( (CURRENT_TIME - LAST_MODIFIED) / 3600 ))
    
    if [ "$HOURS_SINCE_MODIFICATION" -lt 24 ]; then
        echo -e "${GREEN}✓ Deployment log updated recently ($HOURS_SINCE_MODIFICATION hours ago)${NC}"
    else
        echo -e "${YELLOW}⚠ Deployment log not updated in $HOURS_SINCE_MODIFICATION hours${NC}"
        echo "Did you deploy changes? If yes, update DEPLOYMENT_LOG.md"
    fi
else
    echo -e "${RED}✗ Deployment log not found${NC}"
fi

echo ""
echo -e "${YELLOW}Step 4: Checking if ADR is needed...${NC}"

# Check for recent ADRs
ADR_COUNT=$(ls -1 ../docs/adr/ADR-*.md 2>/dev/null | wc -l)
if [ "$ADR_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Found $ADR_COUNT ADR(s)${NC}"
    echo "Recent ADRs:"
    ls -t ../docs/adr/ADR-*.md | head -3
else
    echo -e "${YELLOW}⚠ No ADRs found${NC}"
    echo "Did you make architectural decisions? If yes, create an ADR in docs/adr/"
fi

echo ""
echo -e "${YELLOW}Step 5: Running final checks...${NC}"

# TypeScript compilation
echo "Running TypeScript check..."
if npx tsc --noEmit 2>/dev/null; then
    echo -e "${GREEN}✓ TypeScript compilation passes${NC}"
else
    echo -e "${RED}✗ TypeScript compilation fails${NC}"
    echo "Please fix TypeScript errors before committing"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 6: Checking commit readiness...${NC}"

# Check if ready to commit
if [ "$CHANGED_FILES" -gt 0 ]; then
    echo -e "${GREEN}✓ Ready to commit${NC}"
    echo ""
    echo "Suggested commit message:"
    echo "  git add ."
    echo "  git commit -m \"description of changes\""
    echo "  git push neworigin main"
else
    echo -e "${YELLOW}⚠ No changes to commit${NC}"
fi

echo ""
echo "========================================="
echo -e "${GREEN}Post-task check complete!${NC}"
echo "========================================="
echo ""
echo "Checklist:"
echo "□ Context Brief generated (if new issue)"
echo "□ LEARNING-FROM-MISTAKES.md updated (if debugging >30 min)"
echo "□ DEPLOYMENT_LOG.md updated (if deployment changed)"
echo "□ ADR created (if architectural decision)"
echo "□ TypeScript compilation passes"
echo "□ All tests pass (if applicable)"
echo ""
echo "If all items are checked, you're ready to commit!"