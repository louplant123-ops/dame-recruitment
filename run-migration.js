// Run this script to create the verification_codes table
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

async function runMigration() {
  console.log('🔄 Starting database migration...');

  // Load environment variables from .env file
  loadEnv();

  // Get DATABASE_URL from environment
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ DATABASE_URL environment variable not found!');
    console.log('Please set DATABASE_URL or add it to your .env file');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // First, let's check what tables exist
    console.log('📋 Checking existing tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log('📊 Existing tables:', tablesResult.rows.map(r => r.table_name).join(', '));

    // Create verification_codes table without foreign key constraint for now
    console.log('📝 Creating verification_codes table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS verification_codes (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        type TEXT NOT NULL,
        candidate_id INTEGER,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        used_at TIMESTAMP WITH TIME ZONE
      );
    `);
    console.log('✅ Table created (without foreign key constraint)');

    // Create indexes
    console.log('📝 Creating indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_verification_codes_code ON verification_codes(code);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON verification_codes(expires_at);
    `);
    console.log('✅ Indexes created');

    // Verify table exists
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'verification_codes';
    `);

    if (result.rows.length > 0) {
      console.log('✅ Migration completed successfully!');
      console.log('📊 verification_codes table is ready');
    } else {
      console.log('⚠️ Table may not have been created');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('👋 Database connection closed');
  }
}

runMigration();
