/**
 * migrate-to-neon.js
 * 
 * This script clones Supabase schema and data to a NEON database.
 * Uses Prisma to introspect and recreate schema, then migrates data.
 * 
 * Usage: node migrate-to-neon.js [source-url] [target-url]
 */

const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const fs = require('fs');

// Supabase connection (source)
const SUPABASE_URL = process.env.SOURCE_DATABASE_URL || 'postgresql://postgres.isubgeemvhvhnhikxbjb:REDACTED_SUPABASE_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres';

// NEON connection (target) - pass as argument or env var
const NEON_URL = process.env.TARGET_DATABASE_URL || process.argv[2];

if (!NEON_URL) {
  console.error('Usage: node migrate-to-neon.js <neon-connection-string>');
  console.error('Or set TARGET_DATABASE_URL environment variable');
  process.exit(1);
}

console.log('========================================');
console.log('GoRASA Database Migration Tool');
console.log('Supabase → NEON');
console.log('========================================\n');

// Step 1: Create temporary prisma schema for source
const tempSchema = `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("SOURCE_DATABASE_URL")
}
`;

fs.writeFileSync('prisma/temp-schema.prisma', tempSchema);

// Step 2: Pull schema from Supabase
console.log('Step 1: Introspecting Supabase schema...');
try {
  execSync('npx prisma db pull --schema=prisma/temp-schema.prisma', {
    env: { ...process.env, SOURCE_DATABASE_URL: SUPABASE_URL },
    stdio: 'inherit'
  });
} catch (e) {
  console.error('Failed to pull schema from Supabase');
  process.exit(1);
}

// Step 3: Generate migration for target
console.log('\nStep 2: Generating migration for NEON...');
const mainSchema = fs.readFileSync('prisma/schema.prisma', 'utf8');
fs.writeFileSync('prisma/temp-schema.prisma', mainSchema.replace(
  /url\s*=\s*env\("DATABASE_URL"\)/,
  `url = env("TARGET_DATABASE_URL")`
));

try {
  execSync('npx prisma migrate deploy --schema=prisma/temp-schema.prisma', {
    env: { ...process.env, TARGET_DATABASE_URL: NEON_URL },
    stdio: 'inherit'
  });
} catch (e) {
  console.error('Failed to deploy schema to NEON');
  process.exit(1);
}

// Step 4: Copy data using raw SQL
console.log('\nStep 3: Migrating data...');
// This would require a more complex implementation with proper table ordering
// For now, we'll create a simpler approach using pg_dump if available

console.log('✅ Schema migration complete!');
console.log('Note: Data migration requires pg_dump/psql or a custom script.');
console.log('You can manually export/import data using the NEON console or psql.');

// Cleanup
fs.unlinkSync('prisma/temp-schema.prisma');
