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
echo -e "${YELLOW}Step 2: Checking governance docs are up to date...${NC}"

check_doc() {
    local FILE="$1"
    local NAME="$2"
    if [ -f "$FILE" ]; then
        local LAST_MODIFIED=$(stat -c %Y "$FILE" 2>/dev/null || stat -f %m "$FILE" 2>/dev/null)
        local CURRENT_TIME=$(date +%s)
        local HOURS_SINCE=$(( (CURRENT_TIME - LAST_MODIFIED) / 3600 ))
        if [ "$HOURS_SINCE" -lt 24 ]; then
            echo -e "${GREEN}✓ $NAME updated ($HOURS_SINCE hours ago)${NC}"
        else
            echo -e "${YELLOW}⚠ $NAME not updated in $HOURS_SINCE hours${NC}"
        fi
    else
        echo -e "${RED}✗ $NAME not found${NC}"
    fi
}

check_doc "../LEARNING-FROM-MISTAKES.md" "Learning log"
check_doc "../DEPLOYMENT_LOG.md" "Deployment log"
check_doc "../MEMORY.md" "Project memory"
check_doc "CHANGE-LOG.md" "Change log"

echo ""
echo -e "${YELLOW}Step 3: Checking if ADR is needed...${NC}"

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
echo -e "${YELLOW}Step 4: Running final checks...${NC}"

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
echo -e "${YELLOW}Step 5: Checking commit readiness...${NC}"

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
echo "□ MEMORY.md updated"
echo "□ CHANGE-LOG.md updated"
echo "□ LEARNING-FROM-MISTAKES.md updated (if debugging >30 min)"
echo "□ DEPLOYMENT_LOG.md updated (if deployment changed)"
echo "□ ADR created (if architectural decision)"
echo "□ TypeScript compilation passes"
echo "□ All tests pass (if applicable)"
echo ""
echo "If all items are checked, you're ready to commit!"