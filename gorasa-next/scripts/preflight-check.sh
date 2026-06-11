#!/bin/bash

# GoRASA Governance Pre-Flight Check
# Run this before making any significant changes

set -e

echo "========================================="
echo "GoRASA Governance Pre-Flight Check"
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

echo -e "${YELLOW}Step 1: Checking project documentation...${NC}"

# Check if governance files exist
if [ ! -f "../Sprint-1.md" ]; then
    echo -e "${RED}WARNING: Sprint-1.md not found${NC}"
else
    echo -e "${GREEN}✓ Sprint-1.md found${NC}"
fi

if [ ! -f "../LEARNING-FROM-MISTAKES.md" ]; then
    echo -e "${RED}WARNING: LEARNING-FROM-MISTAKES.md not found${NC}"
else
    echo -e "${GREEN}✓ LEARNING-FROM-MISTAKES.md found${NC}"
fi

if [ ! -f "../CONFIG-REFERENCE.md" ]; then
    echo -e "${RED}WARNING: CONFIG-REFERENCE.md not found${NC}"
else
    echo -e "${GREEN}✓ CONFIG-REFERENCE.md found${NC}"
fi

if [ ! -f "../DEPLOYMENT_LOG.md" ]; then
    echo -e "${RED}WARNING: DEPLOYMENT_LOG.md not found${NC}"
else
    echo -e "${GREEN}✓ DEPLOYMENT_LOG.md found${NC}"
fi

if [ ! -f "../MEMORY.md" ]; then
    echo -e "${RED}WARNING: MEMORY.md not found${NC}"
else
    echo -e "${GREEN}✓ MEMORY.md found${NC}"
fi

if [ ! -f "CHANGE-LOG.md" ]; then
    echo -e "${RED}WARNING: CHANGE-LOG.md not found${NC}"
else
    echo -e "${GREEN}✓ CHANGE-LOG.md found${NC}"
fi

echo ""
echo -e "${YELLOW}Step 2: Checking current state...${NC}"

# Check git status
echo "Git status:"
git status --short

echo ""
echo "Recent commits:"
git log --oneline -5

echo ""
echo -e "${YELLOW}Step 3: Checking TypeScript compilation...${NC}"

# Run TypeScript check
if npx tsc --noEmit 2>/dev/null; then
    echo -e "${GREEN}✓ TypeScript compilation passes${NC}"
else
    echo -e "${RED}✗ TypeScript compilation fails${NC}"
    echo "Please fix TypeScript errors before proceeding"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 4: Checking for existing context brief...${NC}"

# Check if context brief exists for current issue
CONTEXT_BRIEFS=$(ls -1 ../CONTEXT-BRIEF-*.md 2>/dev/null | wc -l)
if [ "$CONTEXT_BRIEFS" -gt 0 ]; then
    echo -e "${GREEN}✓ Found $CONTEXT_BRIEFS context brief(s)${NC}"
    ls -1 ../CONTEXT-BRIEF-*.md
else
    echo -e "${YELLOW}⚠ No context briefs found${NC}"
    echo "Consider creating one if working on a new issue"
fi

echo ""
echo -e "${YELLOW}Step 5: Checking deployment status...${NC}"

# Check if deployment log exists
if [ -f "../DEPLOYMENT_LOG.md" ]; then
    echo -e "${GREEN}✓ Deployment log exists${NC}"
    echo "Last deployment entry:"
    grep -A 2 "^|" ../DEPLOYMENT_LOG.md | tail -3
else
    echo -e "${RED}✗ Deployment log not found${NC}"
fi

echo ""
echo "========================================="
echo -e "${GREEN}Pre-flight check complete!${NC}"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Read the project documentation if you haven't already"
echo "2. Create a context brief if working on a new issue"
echo "3. Make your changes"
echo "4. Update CHANGE-LOG.md with a summary of changes"
echo "5. Update LEARNING-FROM-MISTAKES.md if debugging >30 min"
echo "6. Update DEPLOYMENT_LOG.md if deployment changed"
echo "7. Update MEMORY.md with session context"
echo "8. Create ADR if making architectural decisions"
echo ""
echo "Run './scripts/post-task-check.sh' after completing work"