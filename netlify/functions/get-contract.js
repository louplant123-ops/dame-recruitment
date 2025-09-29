const fetch = require('node-fetch');

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

    // Forward to bridge server to get contract data
    const bridgeUrl = process.env.DAMEDESK_CONTRACT_WEBHOOK_URL || 'https://a78b850bd7bd.ngrok-free.app/api/contracts/get';
    
    const response = await fetch(`${bridgeUrl}?id=${contractId}`, {
      method: 'GET',
      headers: {
        'X-API-Key': process.env.NEXT_PUBLIC_DAMEDESK_API_KEY || 'website-integration'
      }
    });

    if (!response.ok) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Contract not found' })
      };
    }

    const contractData = await response.json();
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
