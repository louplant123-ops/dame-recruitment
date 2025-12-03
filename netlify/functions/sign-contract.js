const { Client } = require('pg');

// Update contract signature in database
async function updateContractSignature(contractId, signatureData, event) {
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

    // Get the full contract text to append signature
    const contractQuery = `SELECT contract_text FROM contacts WHERE contract_id = $1`;
    const contractResult = await client.query(contractQuery, [contractId]);
    
    if (contractResult.rows.length > 0 && contractResult.rows[0].contract_text) {
      const signedDate = new Date().toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const signatureBlock = `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DIGITAL SIGNATURE CONFIRMATION

This contract was digitally signed on: ${signedDate}

Signed by: ${signatureData.fullName}
Position: ${signatureData.position}
Company: ${signatureData.companyName}

IP Address: ${event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'Unknown'}
User Agent: ${event.headers['user-agent'] || 'Unknown'}

This constitutes a legally binding electronic signature under the Electronic 
Communications Act 2000 and the Electronic Signatures Regulations 2002.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

      const signedContractText = contractResult.rows[0].contract_text + signatureBlock;
      
      // Update the contract with signature block
      await client.query(
        `UPDATE contacts SET contract_text = $1 WHERE contract_id = $2`,
        [signedContractText, contractId]
      );
      
      console.log('✅ Contract updated with signature block');
    }

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

    // Create timeline event for contract signing
    try {
      const historyId = `HIST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const insertHistoryQuery = `
        INSERT INTO client_history (
          id, client_id, event_type, event_action, event_date,
          user_name, description, metadata, created_at
        ) VALUES ($1, $2, 'contract', 'signed', NOW(), $3, $4, $5, NOW())
      `;

      const historyValues = [
        historyId,
        contact.id,
        signatureData.fullName,
        `Contract signed by ${signatureData.fullName} (${signatureData.position})`,
        JSON.stringify({
          contract_id: contractId,
          signer_name: signatureData.fullName,
          signer_position: signatureData.position,
          company: signatureData.companyName,
          signed_date: new Date().toISOString(),
          ip_address: event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'Unknown',
          user_agent: event.headers['user-agent'] || 'Unknown'
        })
      ];

      await client.query(insertHistoryQuery, historyValues);
      console.log('✅ Timeline event created for contract signing');
    } catch (historyError) {
      console.error('⚠️ Failed to create timeline event:', historyError);
      // Continue anyway - contract signing is complete
    }

    // Generate client info form ID and update contact
    const infoFormId = `INFO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await client.query(
      `UPDATE contacts SET 
        client_info_form_id = $1,
        client_info_form_sent = NOW()
       WHERE id = $2`,
      [infoFormId, contact.id]
    );
    console.log('✅ Client info form ID generated:', infoFormId);

    await client.end();
    
    return {
      contractId: contractId,
      clientId: contact.id,
      taskId: taskId,
      infoFormId: infoFormId,
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
      signatureData.signatureData,
      event
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
        infoFormUrl: `https://damerecruitment.co.uk/client-info?id=${result.infoFormId}`,
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
