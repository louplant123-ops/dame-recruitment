const { Client } = require('pg');

async function verifyColumns() {
  const client = new Client({
    host: process.env.DB_HOST || 'damedesk-crm-production-do-user-27348714-0.j.db.ondigitalocean.com',
    port: process.env.DB_PORT || 25060,
    database: process.env.DB_NAME || 'defaultdb',
    user: process.env.DB_USER || 'doadmin',
    password: process.env.DB_PASSWORD || 'AVNS_wm_vFxOY5--ftSp64EL',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔄 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database\n');

    // Fields from client-info form
    const formFields = [
      'company_number',
      'vat_number',
      'invoice_contact_name',
      'invoice_contact_email',
      'accounts_contact_name',
      'accounts_contact_email',
      'accounts_contact_phone',
      'ppe_required',
      'ppe_details',
      'site_induction_required',
      'health_safety_contact',
      'site_access_instructions',
      'parking_info',
      'key_decision_makers',
      'preferred_start_dates',
      'preferred_contact_method',
      'best_contact_times'
    ];

    console.log('📋 Checking columns in contacts table...\n');

    const query = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'contacts' 
      AND column_name = ANY($1)
      ORDER BY column_name;
    `;

    const result = await client.query(query, [formFields]);
    
    const foundColumns = result.rows.map(row => row.column_name);
    const missingColumns = formFields.filter(field => !foundColumns.includes(field));

    console.log(`✅ Found ${foundColumns.length} / ${formFields.length} columns:\n`);
    
    result.rows.forEach(row => {
      console.log(`   ✓ ${row.column_name.padEnd(30)} (${row.data_type})`);
    });

    if (missingColumns.length > 0) {
      console.log(`\n❌ Missing ${missingColumns.length} columns:\n`);
      missingColumns.forEach(col => {
        console.log(`   ✗ ${col}`);
      });
      console.log('\n⚠️  These columns need to be added to the database!');
    } else {
      console.log('\n✅ All form fields have matching database columns!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

verifyColumns();
