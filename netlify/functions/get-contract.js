const { getDbClient } = require('./db');

// Get contract from database
async function getContractFromDatabase(contractId) {
  try {
    console.log('🔄 Fetching contract from database...');
    
    const client = getDbClient();
    await client.connect();
    console.log('✅ Connected to database');

    // Get contract from contacts table
    const query = `
      SELECT 
        id,
        name,
        email,
        company,
        contract_terms,
        contract_status,
        contract_sent_date,
        contract_id
      FROM contacts
      WHERE contract_id = $1
    `;

    const result = await client.query(query, [contractId]);
    
    await client.end();
    
    if (result.rows.length === 0) {
      return null;
    }

    const contact = result.rows[0];
    console.log('✅ Contract found:', contractId);

    // Parse contract terms
    let contractTerms = {};
    if (contact.contract_terms) {
      contractTerms = typeof contact.contract_terms === 'string' 
        ? JSON.parse(contact.contract_terms)
        : contact.contract_terms;
    }

    // Format response to match expected structure
    return {
      id: contractId,
      prospectName: contact.name,
      prospectEmail: contact.email,
      prospectCompany: contact.company,
      contractType: contractTerms.type || 'temp',
      status: contact.contract_status || 'sent',
      sentDate: contact.contract_sent_date,
      contractData: contractTerms
    };
    
  } catch (error) {
    console.error('❌ Database query error:', error);
    throw error;
  }
}

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const contractId = event.queryStringParameters?.id;
    
    if (!contractId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Contract ID required' })
      };
    }

    console.log('📋 Fetching contract:', contractId);

    // Get contract from database
    const contractData = await getContractFromDatabase(contractId);
    
    if (!contractData) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Contract not found' })
      };
    }

    console.log('✅ Contract data retrieved');

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contractData)
    };

  } catch (error) {
    console.error('❌ Get contract error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Failed to retrieve contract',
        details: error.message
      })
    };
  }
};
