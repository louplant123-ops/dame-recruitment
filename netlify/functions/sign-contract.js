const { Client } = require('pg');

// Update contract signature in database
async function updateContractSignature(contractId, signatureData) {
  try {
    console.log('🔄 Updating contract signature in database...');
    
    const client = new Client({
      host: process.env.DB_HOST || 'damedesk-crm-production-do-user-27348714-0.j.db.ondigitalocean.com',
      port: process.env.DB_PORT || 25060,
      database: process.env.DB_NAME || 'defaultdb',
      user: process.env.DB_USER || 'doadmin',
      password: process.env.DB_PASSWORD || 'AVNS_wm_vFxOY5--ftSp64EL',
      ssl: {
        rejectUnauthorized: false
      },
      connectionTimeoutMillis: 10000
    });

    await client.connect();
    console.log('✅ Connected to database');

    // Update contact with signature
    const updateQuery = `
      UPDATE contacts 
      SET 
        contract_status = 'signed',
        contract_signed_date = NOW(),
        contract_signed_by = $1,
        contract_signer_position = $2,
        updated_at = NOW()
      WHERE contract_id = $3
      RETURNING id, name, company, contract_terms
    `;

    const values = [
      signatureData.fullName,
      signatureData.position,
      contractId
    ];

    const result = await client.query(updateQuery, values);
    
    if (result.rows.length === 0) {
      throw new Error('Contract not found');
    }

    const contact = result.rows[0];
    let contractTerms = {};
    if (contact.contract_terms) {
      contractTerms = typeof contact.contract_terms === 'string' 
        ? JSON.parse(contact.contract_terms)
        : contact.contract_terms;
    }

    console.log('✅ Contract signed:', contractId);

    // Create task for consultant
    const taskId = `TASK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const insertTaskQuery = `
      INSERT INTO tasks (
        id, title, description, type, priority, status,
        contact_id, due_date, created_at, updated_at
      ) VALUES ($1, $2, $3, 'contract_signed', 'high', 'pending', $4, NOW(), NOW(), NOW())
      RETURNING id, title
    `;

    const taskValues = [
      taskId,
      `Contract Signed: ${signatureData.companyName}`,
      `${signatureData.fullName} has signed the ${contractTerms.type || 'recruitment'} contract. Arrange placements and start work.`,
      contact.id
    ];

    const taskResult = await client.query(insertTaskQuery, taskValues);
    console.log('✅ Task created:', taskResult.rows[0]);

    await client.end();
    
    return {
      contractId: contractId,
      clientId: contact.id,
      taskId: taskId,
      status: 'signed'
    };
    
  } catch (error) {
    console.error('❌ Database update error:', error);
    throw error;
  }
}

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('📋 Processing contract signature');
    
    const signatureData = JSON.parse(event.body);
    
    console.log('📋 Signature data:', {
      contractId: signatureData.contractId,
      signerName: signatureData.signatureData.fullName,
      company: signatureData.signatureData.companyName
    });

    // Update contract in database
    const result = await updateContractSignature(
      signatureData.contractId,
      signatureData.signatureData
    );
    console.log('✅ Contract signed successfully');

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'Contract signed successfully',
        contractId: result.contractId,
        taskId: result.taskId,
        savedToDatabase: true
      })
    };

  } catch (error) {
    console.error('❌ Contract signing error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: 'Failed to sign contract',
        details: error.message
      })
    };
  }
};
