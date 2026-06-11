#!/bin/bash
# setup-github-secrets.sh
# Adds environment secrets to GitHub for staging environments
# 
# Usage: 
#   export DEV_DATABASE_URL="postgresql://..."
#   export DEV_DIRECT_URL="postgresql://..."
#   export QA_DATABASE_URL="postgresql://..."
#   export QA_DIRECT_URL="postgresql://..."
#   bash scripts/setup-github-secrets.sh

set -e

REPO="nikgorasa/gorasav1"

# Dev environment secrets
DEV_ENV="Production – dev-gorasa"
QA_ENV="Production – qa-gorasa"

echo "========================================"
echo "Setting up GitHub Environment Secrets"
echo "========================================"
echo ""

# Validate required env vars
if [ -z "$DEV_DATABASE_URL" ] || [ -z "$QA_DATABASE_URL" ]; then
    echo "Error: Set DEV_DATABASE_URL, DEV_DIRECT_URL, QA_DATABASE_URL, QA_DIRECT_URL"
    echo "Example:"
    echo "  export DEV_DATABASE_URL='postgresql://user:pass@host/gorasa-dev?sslmode=require&pgbouncer=true'"
    exit 1
fi

# Supabase (shared)
SUPABASE_URL="https://isubgeemvhvhnhikxbjb.supabase.co"

add_secret() {
    local env=$1
    local name=$2
    local value=$3
    
    echo "Adding $name to $env..."
    gh secret set "$name" --env "$env" --repo "$REPO" --body "$value" 2>&1 | tail -1
}

echo "Setting up Development environment secrets..."
add_secret "$DEV_ENV" "NEXT_PUBLIC_SUPABASE_URL" "$SUPABASE_URL"
add_secret "$DEV_ENV" "DATABASE_URL" "$DEV_DATABASE_URL"
add_secret "$DEV_ENV" "DIRECT_URL" "$DEV_DIRECT_URL"

echo ""
echo "Setting up QA environment secrets..."
add_secret "$QA_ENV" "NEXT_PUBLIC_SUPABASE_URL" "$SUPABASE_URL"
add_secret "$QA_ENV" "DATABASE_URL" "$QA_DATABASE_URL"
add_secret "$QA_ENV" "DIRECT_URL" "$QA_DIRECT_URL"

echo ""
echo "========================================"
echo "Done! Add remaining secrets manually:"
echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "  - SUPABASE_SERVICE_ROLE_KEY"
echo "  - TBO_USERNAME, TBO_PASSWORD"
echo "  - TBO_HOTEL_USERNAME, TBO_HOTEL_PASSWORD"
echo "  - TBO_ENDPOINT"
echo "  - VERCEL_TOKEN, VERCEL_ORG_ID"
echo "  - VERCEL_DEV_PROJECT_ID, VERCEL_QA_PROJECT_ID"
echo "========================================"
