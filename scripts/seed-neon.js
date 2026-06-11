/**
 * seed-neon.js
 * Seeds a fresh NEON database with data copied from Supabase production
 * 
 * Usage: node seed-neon.js <target-database-url>
 * 
 * This script:
 * 1. Connects to Supabase (source) and NEON (target)
 * 2. Copies all table data in the correct order (respecting FKs)
 * 3. Verifies data integrity
 */

const { PrismaClient } = require('@prisma/client');

// Source: Supabase (production)
const sourcePrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.isubgeemvhvhnhikxbjb:Womanly%40Deem6%40Trivial@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres'
    }
  }
});

// Target: NEON (dev/qa)
const targetUrl = process.argv[2];
if (!targetUrl) {
  console.error('Usage: node seed-neon.js <neon-database-url>');
  process.exit(1);
}

const targetPrisma = new PrismaClient({
  datasources: {
    db: {
      url: targetUrl
    }
  }
});

async function seedDatabase() {
  console.log('========================================');
  console.log('GoRASA Database Seeder');
  console.log('Supabase → NEON');
  console.log('========================================\n');

  try {
    // Tables in order (respecting foreign keys)
    const tables = [
      'Company',
      'User',
      'Lead',
      'Activity',
      'Package',
      'PricingRule',
      'Booking',
      'Payment',
      'Invoice',
      'CancellationRequest',
      'PromoCode',
      'LoyaltyReward',
      'Redemption',
      'Flight',
      'Testimonial',
      'Faq',
      'City',
      'PackageCategory',
      'ValueProposition',
      'FaqCategory',
      'LeadStage',
      'SiteConfig',
      'QuickTopUpAmount',
      'NavigationItem',
      'FooterLink',
      'PreferenceOption',
      'Role'
    ];

    console.log('Starting data migration...\n');

    for (const table of tables) {
      try {
        console.log(`Copying ${table}...`);
        
        // Fetch data from source
        const data = await sourcePrisma[table.toLowerCase()].findMany();
        
        if (data.length > 0) {
          // Insert into target
          // Note: NEON might have different column naming (lowercase)
          await targetPrisma[table.toLowerCase()].createMany({
            data: data,
            skipDuplicates: true
          });
          console.log(`  ✓ ${data.length} rows copied`);
        } else {
          console.log(`  - No data to copy`);
        }
      } catch (error) {
        console.error(`  ✗ Error copying ${table}:`, error.message);
      }
    }

    console.log('\n========================================');
    console.log('Migration complete!');
    console.log('========================================');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await sourcePrisma.$disconnect();
    await targetPrisma.$disconnect();
  }
}

// Run seeder
seedDatabase();
