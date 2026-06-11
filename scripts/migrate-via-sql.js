/**
 * migrate-via-sql.js
 * 
 * Migrates data from Supabase to NEON using raw SQL.
 * Uses the pg module to connect to both databases.
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.join(__dirname, 'gorasa-next', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  });
}

const SUPABASE_URL = process.env.DATABASE_URL;
const NEON_URL = process.argv[2];

if (!NEON_URL) {
  console.error('Usage: node scripts/migrate-via-sql.js <neon-database-url>');
  process.exit(1);
}

// Tables in order (respecting foreign keys)
const TABLES = [
  'Company', 'User', 'Lead', 'Activity', 'Package', 'PricingRule',
  'Booking', 'Payment', 'Invoice', 'CancellationRequest',
  'PromoCode', 'LoyaltyReward', 'Redemption', 'Flight',
  'Testimonial', 'Faq', 'City', 'PackageCategory', 'ValueProposition',
  'FaqCategory', 'LeadStage', 'SiteConfig', 'QuickTopUpAmount',
  'NavigationItem', 'FooterLink', 'PreferenceOption', 'Role'
];

async function migrate() {
  const supabase = new Client({ connectionString: SUPABASE_URL });
  const neon = new Client({ connectionString: NEON_URL });

  try {
    await supabase.connect();
    await neon.connect();
    console.log('Connected to both databases\n');

    let totalRows = 0;

    for (const table of TABLES) {
      process.stdout.write(`Migrating ${table}... `);
      
      try {
        // Fetch from Supabase
        const result = await supabase.query(`SELECT * FROM public."${table}"`);
        const rows = result.rows;
        
        if (rows.length === 0) {
          console.log('(empty)');
          continue;
        }

        // Get column names
        const columns = Object.keys(rows[0]);
        const colList = columns.map(c => `"${c}"`).join(', ');
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

        // Insert into NEON
        let inserted = 0;
        for (const row of rows) {
          const values = columns.map(c => row[c]);
          try {
            await neon.query(
              `INSERT INTO public."${table}" (${colList}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
              values
            );
            inserted++;
          } catch (err) {
            console.error(`\n  ✗ Row error: ${err.message}`);
          }
        }

        console.log(`✓ ${inserted}/${rows.length} rows`);
        totalRows += inserted;
      } catch (err) {
        console.log(`✗ FAILED: ${err.message}`);
      }
    }

    console.log('\n========================================');
    console.log(`Migration complete! Total rows: ${totalRows}`);
    console.log('========================================');

  } catch (err) {
    console.error('Connection error:', err.message);
  } finally {
    await supabase.end();
    await neon.end();
  }
}

migrate();
