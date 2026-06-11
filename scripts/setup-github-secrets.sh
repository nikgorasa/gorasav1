#!/bin/bash
# setup-github-secrets.sh
# Adds environment secrets to GitHub for staging environments

set -e

REPO="nikgorasa/gorasav1"

# Dev environment secrets
DEV_ENV="Production – dev-gorasa"
QA_ENV="Production – qa-gorasa"

echo "========================================"
echo "Setting up GitHub Environment Secrets"
echo "========================================"
echo ""

# Supabase (shared)
SUPABASE_URL="https://isubgeemvhvhnhikxbjb.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzdWJnZWVtdmh2aG5oaWt4YmpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MTA4MzQsImV4cCI6MjA5NjM4NjgzNH0.NpmJdqkeSHW236ghgchCdx_B1UpMGngDRRg6W0qcrhg"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzdWJnZWVtdmh2aG5oaWt4YmpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDgxMDgzNCwiZXhwIjoyMDk2Mzg2ODM0fQ.QJ3t7hNqVPBCqF-JFgCfPF4FrRJrO4CZ7kPFsGJfp3E"

# TBO credentials (shared)
TBO_USERNAME="RasaT"
TBO_PASSWORD="RasaT@123"
TBO_HOTEL_USERNAME="TBOStaticAPITest"
TBO_HOTEL_PASSWORD="Tbo@11530818"
TBO_ENDPOINT="http://api.tbotechnology.in/hotelapi_v7/hotelservice.svc"

# NEON Dev database
DEV_DATABASE_URL="postgresql://neondb_owner:npg_Ydfi2Oyu3Vmx@ep-quiet-tooth-aiehj2mq-pooler.c-4.us-east-1.aws.neon.tech/gorasa-dev?sslmode=require&pgbouncer=true"
DEV_DIRECT_URL="postgresql://neondb_owner:npg_Ydfi2Oyu3Vmx@ep-quiet-tooth-aiehj2mq.c-4.us-east-1.aws.neon.tech/gorasa-dev?sslmode=require"

# NEON QA database
QA_DATABASE_URL="postgresql://neondb_owner:npg_Ydfi2Oyu3Vmx@ep-quiet-tooth-aiehj2mq-pooler.c-4.us-east-1.aws.neon.tech/gorasa-qa?sslmode=require&pgbouncer=true"
QA_DIRECT_URL="postgresql://neondb_owner:npg_Ydfi2Oyu3Vmx@ep-quiet-tooth-aiehj2mq.c-4.us-east-1.aws.neon.tech/gorasa-qa?sslmode=require"

add_secret() {
    local env=$1
    local name=$2
    local value=$3
    
    echo "Adding $name to $env..."
    gh secret set "$name" --env "$env" --repo "$REPO" --body "$value" 2>&1 | tail -1
}

echo "Setting up Development environment secrets..."
add_secret "$DEV_ENV" "NEXT_PUBLIC_SUPABASE_URL" "$SUPABASE_URL"
add_secret "$DEV_ENV" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY"
add_secret "$DEV_ENV" "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_KEY"
add_secret "$DEV_ENV" "DATABASE_URL" "$DEV_DATABASE_URL"
add_secret "$DEV_ENV" "DIRECT_URL" "$DEV_DIRECT_URL"
add_secret "$DEV_ENV" "TBO_USERNAME" "$TBO_USERNAME"
add_secret "$DEV_ENV" "TBO_PASSWORD" "$TBO_PASSWORD"
add_secret "$DEV_ENV" "TBO_HOTEL_USERNAME" "$TBO_HOTEL_USERNAME"
add_secret "$DEV_ENV" "TBO_HOTEL_PASSWORD" "$TBO_HOTEL_PASSWORD"
add_secret "$DEV_ENV" "TBO_ENDPOINT" "$TBO_ENDPOINT"

echo ""
echo "Setting up QA environment secrets..."
add_secret "$QA_ENV" "NEXT_PUBLIC_SUPABASE_URL" "$SUPABASE_URL"
add_secret "$QA_ENV" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY"
add_secret "$QA_ENV" "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_KEY"
add_secret "$QA_ENV" "DATABASE_URL" "$QA_DATABASE_URL"
add_secret "$QA_ENV" "DIRECT_URL" "$QA_DIRECT_URL"
add_secret "$QA_ENV" "TBO_USERNAME" "$TBO_USERNAME"
add_secret "$QA_ENV" "TBO_PASSWORD" "$TBO_PASSWORD"
add_secret "$QA_ENV" "TBO_HOTEL_USERNAME" "$TBO_HOTEL_USERNAME"
add_secret "$QA_ENV" "TBO_HOTEL_PASSWORD" "$TBO_HOTEL_PASSWORD"
add_secret "$QA_ENV" "TBO_ENDPOINT" "$TBO_ENDPOINT"

echo ""
echo "========================================"
echo "GitHub environment secrets configured!"
echo "========================================"
