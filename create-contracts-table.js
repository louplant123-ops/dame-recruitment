// Create contracts table in database
const { Client } = require('pg');

async function createContractsTable() {
  console.log('🔧 Creating contracts table in database...\n');

  try {
    const client = new Client({
      host: 'damedesk-crm-production-do-user-27348714-0.j.db.ondigitalocean.com',
      port: 25060,
      database: 'defaultdb',
      user: 'doadmin',
      password: 'AVNS_wm_vFxOY5--ftSp64EL',
      ssl: {
        rejectUnauthorized: false
      },
      connectionTimeoutMillis: 10000
    });

    await client.connect();
    console.log('✅ Connected to database');

    // Create contracts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS contracts (
        id TEXT PRIMARY KEY,
        client_id TEXT NOT NULL,
        contract_type TEXT CHECK (contract_type IN ('temp', 'perm')),
        status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'signed', 'expired')),
        sent_date TIMESTAMP,
        signed_date TIMESTAMP,
        signer_name TEXT,
        signer_position TEXT,
        signer_company TEXT,
        contract_terms JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Contracts table created successfully!');

    await client.end();

  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

createContractsTable();
