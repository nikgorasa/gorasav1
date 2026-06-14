#!/bin/bash

# Command Guard — blocks dangerous commands before they run
# AI agents should run this before any shell command
# Usage: bash scripts/command-guard.sh "command to check"

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

CMD="$1"

# List of blocked commands (regex patterns)
BLOCKED_PATTERNS=(
    # Vercel CLI dangerous commands
    "vercel deploy --prod"
    "vercel env"
    "vercel link"
    "vercel project"
    
    # Dangerous git commands
    "git push --force"
    "git push -f"
    "git reset --hard"
    "git clean -f"
    
    # Dangerous file deletions
    "rm -rf \.env"
    "rm -rf \.vercel"
    "rm -rf node_modules"
    "rm -f \.env"
    "rm \.env"
    "rm -rf prisma"
    "rm -rf \.github"
    
    # Dangerous GitHub CLI commands
    "gh secret delete"
    "gh secret set.*--body"  # Only block direct body, allow interactive
    
    # Dangerous Supabase commands
    "supabase db reset"
    "supabase migration down"
)

# List of commands that require user approval
REQUIRE_APPROVAL=(
    "git remote"
    "git push origin main"
    "git push origin qa"
    "npm uninstall"
    "npx prisma migrate"
    "npx prisma db push"
)

# Check blocked patterns
for pattern in "${BLOCKED_PATTERNS[@]}"; do
    if echo "$CMD" | grep -qE "$pattern"; then
        echo -e "${RED}[BLOCKED]${NC} This command is not allowed: $CMD"
        echo -e "${RED}[BLOCKED]${NC} Reason: Matches blocked pattern: $pattern"
        echo -e "${RED}[BLOCKED]${NC} Read DEPLOY.md for allowed commands"
        exit 1
    fi
done

# Check commands requiring approval
for pattern in "${REQUIRE_APPROVAL[@]}"; do
    if echo "$CMD" | grep -qE "$pattern"; then
        echo -e "${YELLOW}[APPROVAL REQUIRED]${NC} This command needs user approval: $CMD"
        echo -e "${YELLOW}[APPROVAL REQUIRED]${NC} Ask the user before running this"
        exit 2
    fi
done

# Command is safe
echo -e "${GREEN}[ALLOWED]${NC} Command is safe: $CMD"

# Additional check: scan for secrets in command
SECRET_PATTERNS='(napi_[a-zA-Z0-9_-]{20,}|npg_[a-zA-Z0-9_-]{20,}|eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}|sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{36}|gho_[a-zA-Z0-9]{36})'

if echo "$CMD" | grep -qE "$SECRET_PATTERNS"; then
    echo -e "${YELLOW}[WARNING]${NC} Command contains what looks like a secret"
    echo -e "${YELLOW}[WARNING]${NC} Make sure you're not exposing credentials"
fi

exit 0
