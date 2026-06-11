/**
 * migrate-supabase-to-neon.js
 * 
 * Migrates all data from Supabase to a NEON database.
 * Uses Supabase JS client for reading, Prisma for writing.
 * 
 * Usage: 
 *   node scripts/migrate-supabase-to-neon.js <neon-database-url>
 * 
 * Environment variables (or use .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required.');
  console.error('Set them in .env.local or export them before running this script.');
  process.exit(1);
}

const neonUrl = process.argv[2];
if (!neonUrl) {
  console.error('Usage: node scripts/migrate-supabase-to-neon.js <neon-database-url>');
  console.error('');
  console.error('This script migrates all data from Supabase production to a NEON database.');
  console.error('Make sure the NEON database already has the schema (run prisma migrate deploy first).');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const neonPrisma = new PrismaClient({
  datasources: { db: { url: neonUrl } }
});

// Table migration order (respects foreign key dependencies)
const TABLES = [
  { name: 'Company', supabase: 'Company', hasTimestamps: true },
  { name: 'User', supabase: 'User', hasTimestamps: true },
  { name: 'Lead', supabase: 'Lead', hasTimestamps: true },
  { name: 'Activity', supabase: 'Activity', hasTimestamps: true },
  { name: 'Package', supabase: 'Package', hasTimestamps: true },
  { name: 'PricingRule', supabase: 'PricingRule', hasTimestamps: true },
  { name: 'Booking', supabase: 'Booking', hasTimestamps: true },
  { name: 'Payment', supabase: 'Payment', hasTimestamps: true },
  { name: 'Invoice', supabase: 'Invoice', hasTimestamps: true },
  { name: 'CancellationRequest', supabase: 'CancellationRequest', hasTimestamps: true },
  { name: 'PromoCode', supabase: 'PromoCode', hasTimestamps: true },
  { name: 'LoyaltyReward', supabase: 'LoyaltyReward', hasTimestamps: true },
  { name: 'Redemption', supabase: 'Redemption', hasTimestamps: true },
  { name: 'Flight', supabase: 'Flight', hasTimestamps: true },
  { name: 'Testimonial', supabase: 'Testimonial', hasTimestamps: true },
  { name: 'Faq', supabase: 'Faq', hasTimestamps: true },
  { name: 'City', supabase: 'City', hasTimestamps: true },
  { name: 'PackageCategory', supabase: 'PackageCategory', hasTimestamps: true },
  { name: 'ValueProposition', supabase: 'ValueProposition', hasTimestamps: true },
  { name: 'FaqCategory', supabase: 'FaqCategory', hasTimestamps: true },
  { name: 'LeadStage', supabase: 'LeadStage', hasTimestamps: true },
  { name: 'SiteConfig', supabase: 'SiteConfig', hasTimestamps: true },
  { name: 'QuickTopUpAmount', supabase: 'QuickTopUpAmount', hasTimestamps: true },
  { name: 'NavigationItem', supabase: 'NavigationItem', hasTimestamps: true },
  { name: 'FooterLink', supabase: 'FooterLink', hasTimestamps: true },
  { name: 'PreferenceOption', supabase: 'PreferenceOption', hasTimestamps: true },
  { name: 'Role', supabase: 'Role', hasTimestamps: true },
];

async function fetchFromSupabase(tableName) {
  const { data, error } = await supabase
    .from(tableName)
    .select('*');
  
  if (error) {
    throw new Error(`Supabase fetch error for ${tableName}: ${error.message}`);
  }
  return data || [];
}

async function insertToNeon(tableName, data) {
  if (data.length === 0) return 0;
  
  const model = neonPrisma[tableName.charAt(0).toLowerCase() + tableName.slice(1)];
  if (!model) {
    console.warn(`  ⚠ No Prisma model found for ${tableName}, skipping...`);
    return 0;
  }

  let inserted = 0;
  for (const row of data) {
    try {
      await model.create({ data: row });
      inserted++;
    } catch (err) {
      if (err.code === 'P2002') {
        // Unique constraint violation - row already exists
        console.warn(`  ⚠ Duplicate row in ${tableName}, skipping...`);
      } else {
        console.error(`  ✗ Error inserting into ${tableName}:`, err.message);
      }
    }
  }
  return inserted;
}

async function migrate() {
  console.log('========================================');
  console.log('GoRASA Data Migration');
  console.log('Supabase → NEON');
  console.log('========================================\n');
  
  console.log(`Source: ${SUPABASE_URL}`);
  console.log(`Target: ${neonUrl.substring(0, 50)}...`);
  console.log('');

  let totalRows = 0;
  let successTables = 0;
  let failedTables = [];

  for (const table of TABLES) {
    process.stdout.write(`Migrating ${table.name}... `);
    
    try {
      const data = await fetchFromSupabase(table.supabase);
      
      if (data.length === 0) {
        console.log('(empty)');
        successTables++;
        continue;
      }

      const inserted = await insertToNeon(table.name, data);
      console.log(`✓ ${inserted}/${data.length} rows`);
      totalRows += inserted;
      successTables++;
    } catch (err) {
      console.log(`✗ FAILED: ${err.message}`);
      failedTables.push(table.name);
    }
  }

  console.log('\n========================================');
  console.log('Migration Summary');
  console.log('========================================');
  console.log(`Tables migrated: ${successTables}/${TABLES.length}`);
  console.log(`Total rows: ${totalRows}`);
  
  if (failedTables.length > 0) {
    console.log(`\nFailed tables: ${failedTables.join(', ')}`);
    console.log('Note: Some tables may not exist in Supabase yet.');
  }

  console.log('\n✅ Migration complete!');
  
  await neonPrisma.$disconnect();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
