#!/bin/bash
# setup-staging.sh
# Complete setup script for GoRASA staging environments
# Run this after creating NEON databases

echo "========================================"
echo "GoRASA Staging Environment Setup"
echo "========================================"
echo ""

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo "❌ git not found. Please install Git"
    exit 1
fi

echo "✅ Prerequisites met"
echo ""

# Function to create Vercel project
create_vercel_project() {
    local project_name=$1
    local branch=$2
    
    echo "Creating Vercel project: $project_name..."
    echo "This will be linked to branch: $branch"
    echo ""
    
    # Note: This requires interactive input or Vercel CLI with token
    # The user will need to run: npx vercel --target $project_name
    echo "Please run: cd gorasa-next && npx vercel"
    echo "When prompted, set project name to: $project_name"
    echo ""
}

# Step 1: Verify branches
echo "Step 1: Verifying git branches..."
git fetch neworigin
echo "Available branches:"
git branch -a | grep -E '(dev|qa|main)'
echo ""

# Step 2: Create Vercel projects
echo "Step 2: Creating Vercel projects..."
echo "You need to create 2 Vercel projects:"
echo "  1. gorasa-dev (for dev branch)"
echo "  2. gorasa-qa (for qa branch)"
echo ""

create_vercel_project "gorasa-dev" "dev"
create_vercel_project "gorasa-qa" "qa"

# Step 3: Environment variables
echo "Step 3: Setting up environment variables..."
echo "For each project, set these variables in Vercel Dashboard:"
echo ""
echo "Shared variables (same as production):"
echo "  - NEXT_PUBLIC_SUPABASE_URL"
echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "  - SUPABASE_SERVICE_ROLE_KEY"
echo "  - TBO_USERNAME"
echo "  - TBO_PASSWORD"
echo "  - TBO_HOTEL_USERNAME"
echo "  - TBO_HOTEL_PASSWORD"
echo "  - TBO_ENDPOINT"
echo ""
echo "Project-specific variables:"
echo ""
echo "gorasa-dev:"
echo "  - DATABASE_URL=<NEON-DEV-URL>"
echo "  - DIRECT_URL=<NEON-DEV-DIRECT-URL>"
echo ""
echo "gorasa-qa:"
echo "  - DATABASE_URL=<NEON-QA-URL>"
echo "  - DIRECT_URL=<NEON-QA-DIRECT-URL>"
echo ""

# Step 4: Manual steps
echo "Step 4: Manual steps required..."
echo ""
echo "1. Create NEON project at https://neon.tech"
echo "2. Create databases: gorasa-dev, gorasa-qa"
echo "3. Get connection strings (pooled + direct)"
echo "4. Migrate schema using Prisma:"
echo "   DATABASE_URL=<neon-url> npx prisma migrate deploy"
echo "5. Seed data (copy from production or use seed script)"
echo ""

echo "========================================"
echo "Setup complete!"
echo "Next steps:"
echo "  1. Create NEON databases"
echo "  2. Run the Vercel commands above"
echo "  3. Configure environment variables"
echo "  4. Deploy and test"
echo "========================================"
