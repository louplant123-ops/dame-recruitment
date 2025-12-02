// Check for duplicate emails in the database
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load .env file
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const lines = envContent.split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=');
        if (key && value) {
          process.env[key.trim()] = value.trim();
        }
      }
    });
  }
}

async function checkDuplicates() {
  console.log('🔍 Checking for duplicate emails...\n');

  loadEnv();

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    // Find duplicate emails
    const result = await client.query(`
      SELECT 
        email,
        COUNT(*) as count,
        STRING_AGG(id::text, ', ') as contact_ids,
        STRING_AGG(name, ' | ') as names,
        STRING_AGG(type, ' | ') as types
      FROM contacts
      WHERE email IS NOT NULL AND email != ''
      GROUP BY LOWER(email)
      HAVING COUNT(*) > 1
      ORDER BY COUNT(*) DESC, email;
    `);

    if (result.rows.length === 0) {
      console.log('✅ No duplicate emails found! Your database is clean.\n');
    } else {
      console.log(`⚠️  Found ${result.rows.length} duplicate email(s):\n`);
      console.log('━'.repeat(100));
      
      result.rows.forEach((row, index) => {
        console.log(`\n${index + 1}. Email: ${row.email}`);
        console.log(`   Count: ${row.count} contacts`);
        console.log(`   IDs: ${row.contact_ids}`);
        console.log(`   Names: ${row.names}`);
        console.log(`   Types: ${row.types}`);
      });

      console.log('\n' + '━'.repeat(100));
      console.log(`\n📊 Total duplicate emails: ${result.rows.length}`);
      console.log(`📊 Total affected contacts: ${result.rows.reduce((sum, row) => sum + parseInt(row.count), 0)}\n`);
    }

    // Also check for NULL/empty emails
    const emptyResult = await client.query(`
      SELECT COUNT(*) as count
      FROM contacts
      WHERE email IS NULL OR email = '';
    `);

    if (emptyResult.rows[0].count > 0) {
      console.log(`ℹ️  ${emptyResult.rows[0].count} contact(s) have no email address\n`);
    }

    await client.end();

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDuplicates();
