// Create a test contract in the database
const { Client } = require('pg');

async function createTestContract() {
  console.log('🧪 Creating test contract in database...\n');

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

    // Use the test client we created earlier
    const clientId = 'CLIENT_1761080492992_1bi8hfcso';
    const contractId = `CONTRACT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const contractTerms = {
      type: 'temp',
      standardRate: 15.50,
      marginPercentage: 25,
      paymentTerms: 14,
      minimumHours: 0
    };

    const insertQuery = `
      INSERT INTO contracts (
        id, client_id, contract_type, status, sent_date,
        contract_terms, created_at, updated_at
      ) VALUES ($1, $2, 'temp', 'sent', NOW(), $3, NOW(), NOW())
      RETURNING id, client_id, contract_type, status
    `;

    const values = [
      contractId,
      clientId,
      JSON.stringify(contractTerms)
    ];

    const result = await client.query(insertQuery, values);
    console.log('✅ Contract created:', result.rows[0]);

    await client.end();

    console.log('\n📋 Test Contract Details:');
    console.log('Contract ID:', contractId);
    console.log('Client ID:', clientId);
    console.log('Type: Temp');
    console.log('Status: Sent');
    console.log('Terms:', contractTerms);
    
    console.log('\n🔗 Signing URL:');
    console.log(`https://damerecruitment.co.uk/contract-signing?id=${contractId}`);
    
    console.log('\n✅ Test this URL in your browser to sign the contract!');

  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

createTestContract();
