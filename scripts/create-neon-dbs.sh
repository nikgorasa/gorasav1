#!/bin/bash
# create-neon-dbs.sh
# Helper script for creating NEON databases

echo "========================================"
echo "GoRASA NEON Database Setup"
echo "========================================"
echo ""

# Check if psql is available (usually not in this environment)
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL client found"
    HAS_PSQL=true
else
    echo "⚠️  PostgreSQL client not found (psql)"
    echo "You'll need to use the NEON web console or install PostgreSQL client"
    HAS_PSQL=false
fi

echo ""
echo "Prerequisites:"
echo "1. Sign up at https://neon.tech"
echo "2. Create a new project called 'gorasa'"
echo "3. Note down the connection strings"
echo ""

read -p "Press Enter once you've created the NEON project..."

echo ""
echo "Step 1: Create databases"
echo "In your NEON project dashboard:"
echo "  - Click 'Databases' → 'Create database'"
echo "  - Create: gorasa-dev"
echo "  - Create: gorasa-qa"
echo ""

read -p "Press Enter once databases are created..."

echo ""
echo "Step 2: Get connection strings"
echo "For each database, click on it and copy:"
echo "  1. Pooled connection (for DATABASE_URL)"
echo "  2. Direct connection (for DIRECT_URL)"
echo ""

read -p "Press Enter once you have the connection strings..."

echo ""
echo "Step 3: Run Prisma migrations"
echo ""
echo "For DEV database:"
echo "  cd gorasa-next"
echo "  DATABASE_URL=<neon-dev-pooled-url> \\"
echo "  DIRECT_URL=<neon-dev-direct-url> \\"
echo "  npx prisma migrate deploy"
echo ""
echo "For QA database:"
echo "  cd gorasa-next"
echo "  DATABASE_URL=<neon-qa-pooled-url> \\"
echo "  DIRECT_URL=<neon-qa-direct-url> \\"
echo "  npx prisma migrate deploy"
echo ""

read -p "Press Enter once migrations are complete..."

echo ""
echo "Step 4: Seed data (optional)"
echo ""
echo "Option A: Copy from production using seed script:"
echo "  node scripts/seed-neon.js <neon-database-url>"
echo ""
echo "Option B: Manual data export/import using PostgreSQL tools"
echo ""

echo ""
echo "========================================"
echo "Database setup complete!"
echo ""
echo "Next: Create Vercel projects"
echo "  1. cd gorasa-next"
echo "  2. npx vercel (for dev)"
echo "  3. npx vercel (for qa)"
echo ""
echo "See SETUP-GUIDE.md for full details"
echo "========================================"
