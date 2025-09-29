const fetch = require('node-fetch');

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

    // Forward to bridge server to process signature
    const bridgeUrl = process.env.DAMEDESK_CONTRACT_WEBHOOK_URL || 'https://a78b850bd7bd.ngrok-free.app/api/contracts/sign';
    
    const response = await fetch(bridgeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.NEXT_PUBLIC_DAMEDESK_API_KEY || 'website-integration'
      },
      body: JSON.stringify(signatureData)
    });

    if (!response.ok) {
      throw new Error(`Bridge server responded with ${response.status}`);
    }

    const result = await response.json();
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
        contractId: signatureData.contractId
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
