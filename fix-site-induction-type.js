const { Client } = require('pg');

async function fixColumnType() {
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

  if (!process.env.DB_HOST || !process.env.DB_PASSWORD) {
    console.error('ERROR: DB_HOST and DB_PASSWORD environment variables are required.');
    process.exit(1);
  }

  try {
    console.log('🔄 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database\n');

    console.log('📝 Changing site_induction_required from boolean to text...');
    
    const alterQuery = `
      ALTER TABLE contacts 
      ALTER COLUMN site_induction_required TYPE TEXT 
      USING CASE 
        WHEN site_induction_required = true THEN 'Required'
        WHEN site_induction_required = false THEN 'Not required'
        ELSE NULL
      END;
    `;

    await client.query(alterQuery);
    console.log('✅ Column type changed successfully\n');

    console.log('🔍 Verifying column type...');
    const verifyQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'contacts' 
      AND column_name = 'site_induction_required';
    `;

    const result = await client.query(verifyQuery);
    console.log(`✅ site_induction_required is now: ${result.rows[0].data_type}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

fixColumnType();
