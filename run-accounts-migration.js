const { Client } = require('pg');

async function runMigration() {
  if (!process.env.DB_HOST || !process.env.DB_PASSWORD) {
    console.error('ERROR: DB_HOST and DB_PASSWORD environment variables are required.');
    process.exit(1);
  }

  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 25060,
    database: process.env.DB_NAME || 'defaultdb',
    user: process.env.DB_USER || 'doadmin',
    password: process.env.DB_PASSWORD,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔄 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    console.log('\n📝 Adding new columns to contacts table...');
    
    const alterQuery = `
      ALTER TABLE contacts 
      ADD COLUMN IF NOT EXISTS company_number VARCHAR(50),
      ADD COLUMN IF NOT EXISTS vat_number VARCHAR(50),
      ADD COLUMN IF NOT EXISTS accounts_contact_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS accounts_contact_email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS accounts_contact_phone VARCHAR(50);
    `;

    await client.query(alterQuery);
    console.log('✅ Columns added successfully');

    console.log('\n🔍 Verifying columns...');
    const verifyQuery = `
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'contacts' 
      AND column_name IN ('company_number', 'vat_number', 'accounts_contact_name', 'accounts_contact_email', 'accounts_contact_phone')
      ORDER BY column_name;
    `;

    const result = await client.query(verifyQuery);
    
    if (result.rows.length === 5) {
      console.log('✅ All columns verified:');
      result.rows.forEach(row => {
        console.log(`   - ${row.column_name} (${row.data_type}${row.character_maximum_length ? `(${row.character_maximum_length})` : ''})`);
      });
    } else {
      console.log('⚠️  Warning: Expected 5 columns, found', result.rows.length);
      result.rows.forEach(row => {
        console.log(`   - ${row.column_name}`);
      });
    }

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

runMigration();
