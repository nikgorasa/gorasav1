/**
 * verify-migration.js
 * 
 * Verifies that NEON database has the same data as Supabase.
 * 
 * Usage: node scripts/verify-migration.js <neon-database-url>
 */

const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

const SUPABASE_URL = 'https://isubgeemvhvhnhikxbjb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzdWJnZWVtdmh2aG5oaWt4YmpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDgxMDgzNCwiZXhwIjoyMDk2Mzg2ODM0fQ.QJ3t7hNqVPBCqF-JFgCfPF4FrRJrO4CZ7kPFsGJfp3E';

const neonUrl = process.argv[2];
if (!neonUrl) {
  console.error('Usage: node scripts/verify-migration.js <neon-database-url>');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const neonPrisma = new PrismaClient({ datasources: { db: { url: neonUrl } } });

const TABLES = [
  'Company', 'User', 'Lead', 'Activity', 'Package', 'PricingRule',
  'Booking', 'Payment', 'Invoice', 'CancellationRequest',
  'PromoCode', 'LoyaltyReward', 'Redemption', 'Flight',
  'Testimonial', 'Faq', 'City', 'PackageCategory', 'ValueProposition',
  'FaqCategory', 'LeadStage', 'SiteConfig', 'QuickTopUpAmount',
  'NavigationItem', 'FooterLink', 'PreferenceOption', 'Role'
];

async function verify() {
  console.log('========================================');
  console.log('Migration Verification');
  console.log('========================================\n');

  let allMatch = true;
  const results = [];

  for (const table of TABLES) {
    const { count: supabaseCount } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    let neonCount;
    try {
      const model = neonPrisma[table.charAt(0).toLowerCase() + table.slice(1)];
      neonCount = await model.count();
    } catch {
      neonCount = 'N/A';
    }

    const match = supabaseCount === neonCount;
    if (!match) allMatch = false;

    results.push({
      table,
      supabase: supabaseCount,
      neon: neonCount,
      status: match ? '✓' : '✗'
    });
  }

  console.log('Table'.padEnd(25) + 'Supabase'.padEnd(12) + 'NEON'.padEnd(12) + 'Status');
  console.log('-'.repeat(55));
  
  for (const r of results) {
    console.log(
      r.table.padEnd(25) + 
      String(r.supabase).padEnd(12) + 
      String(r.neon).padEnd(12) + 
      r.status
    );
  }

  console.log('\n========================================');
  console.log(allMatch ? '✅ ALL TABLES MATCH!' : '⚠️  SOME TABLES DIFFER');
  console.log('========================================');

  await neonPrisma.$disconnect();
}

verify().catch(console.error);
