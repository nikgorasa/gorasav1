#!/bin/bash
# db-check.sh — Compare DB schemas and data across environments
# Usage: bash scripts/db-check.sh [dev|qa|prod]
# Compares NEON (dev) against the target environment

set -e

TARGET=${1:-"qa"}
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "════════════════════════════════════════════════════"
echo "  DB Schema & Data Check — Target: $TARGET"
echo "════════════════════════════════════════════════════"

# Connection strings — use env vars
DEV_URL="${DEV_DATABASE_URL:-postgresql://neondb_owner:REDACTED_NEON_DEV_PASSWORD@ep-quiet-tooth-aiehj2mq-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require}"
QA_URL="${QA_DATABASE_URL:-postgresql://neondb_owner:REDACTED_NEON_QA_PASSWORD@ep-wispy-thunder-adigjqv3-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require}"

if [ "$TARGET" = "qa" ]; then
  TARGET_URL="$QA_URL"
elif [ "$TARGET" = "dev" ]; then
  TARGET_URL="$DEV_URL"
else
  echo -e "${RED}Unknown target: $TARGET. Use 'dev' or 'qa'.${NC}"
  exit 1
fi

# Check if node and pg are available
if ! command -v node &> /dev/null; then
  echo -e "${RED}node not found${NC}"
  exit 1
fi

node -e "
const TARGET = '$TARGET';
const { Pool } = require('pg');
const devPool = new Pool({ connectionString: '$DEV_URL' });
const targetPool = new Pool({ connectionString: '$TARGET_URL' });

async function check() {
  let errors = 0;
  let warnings = 0;

  // 1. Compare table lists
  const devTables = await devPool.query(\"SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name\");
  const targetTables = await targetPool.query(\"SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name\");
  
  const devTableNames = devTables.rows.map(r => r.table_name);
  const targetTableNames = targetTables.rows.map(r => r.table_name);
  
  const missingInTarget = devTableNames.filter(t => !targetTableNames.includes(t));
  const extraInTarget = targetTableNames.filter(t => !devTableNames.includes(t));
  
  if (missingInTarget.length > 0) {
    console.log('ERROR: Tables in DEV but not in ' + TARGET.toUpperCase() + ': ' + missingInTarget.join(', '));
    errors++;
  }
  if (extraInTarget.length > 0) {
    console.log('WARN: Tables in ' + TARGET.toUpperCase() + ' but not in DEV: ' + extraInTarget.join(', '));
    warnings++;
  }

  // 2. Compare columns for common tables
  const commonTables = devTableNames.filter(t => targetTableNames.includes(t));
  for (const table of commonTables) {
    const devCols = await devPool.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \$1 ORDER BY ordinal_position', [table]);
    const targetCols = await targetPool.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \$1 ORDER BY ordinal_position', [table]);
    
    const devColNames = devCols.rows.map(r => r.column_name);
    const targetColNames = targetCols.rows.map(r => r.column_name);
    
    const missingCols = devColNames.filter(c => !targetColNames.includes(c));
    const extraCols = targetColNames.filter(c => !devColNames.includes(c));
    
    if (missingCols.length > 0) {
      console.log('ERROR: Columns in DEV.' + table + ' but not in ' + TARGET.toUpperCase() + ': ' + missingCols.join(', '));
      errors++;
    }
    if (extraCols.length > 0) {
      console.log('WARN: Columns in ' + TARGET.toUpperCase() + '.' + table + ' but not in DEV: ' + extraCols.join(', '));
      warnings++;
    }
  }

  // 3. Compare NavigationItem data
  const devNav = await devPool.query('SELECT label, section, sortorder, isactive FROM \"NavigationItem\" ORDER BY section, sortorder');
  const targetNav = await targetPool.query('SELECT label, section, sortorder, isactive FROM \"NavigationItem\" ORDER BY section, sortorder');
  
  const devNavStr = JSON.stringify(devNav.rows);
  const targetNavStr = JSON.stringify(targetNav.rows);
  
  if (devNavStr !== targetNavStr) {
    console.log('ERROR: NavigationItem data mismatch between DEV and ' + TARGET.toUpperCase());
    errors++;
  }

  // 4. Compare PackageCategory data
  const devCats = await devPool.query('SELECT id, title, sortorder FROM \"PackageCategory\" ORDER BY sortorder');
  const targetCats = await targetPool.query('SELECT id, title, sortorder FROM \"PackageCategory\" ORDER BY sortorder');
  
  const devCatsStr = JSON.stringify(devCats.rows);
  const targetCatsStr = JSON.stringify(targetCats.rows);
  
  if (devCatsStr !== targetCatsStr) {
    console.log('ERROR: PackageCategory data mismatch between DEV and ' + TARGET.toUpperCase());
    errors++;
  }

  // Summary
  console.log('');
  if (errors === 0 && warnings === 0) {
    console.log('✅ All schemas and data in sync between DEV and ' + TARGET.toUpperCase());
  } else {
    if (errors > 0) console.log('❌ ' + errors + ' error(s) found');
    if (warnings > 0) console.log('⚠️  ' + warnings + ' warning(s) found');
  }
  
  await devPool.end();
  await targetPool.end();
  
  process.exit(errors > 0 ? 1 : 0);
}
check().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
" 2>&1 | grep -v "Warning: SECURITY WARNING"
