const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('📋 Netlify Function: Received Part 2 registration submission');
    
    // Parse the request body
    const formData = JSON.parse(event.body);
    
    console.log('📋 Part 2 data:', {
      candidateId: formData.candidateId,
      hasContract: formData.contractAccepted,
      rightToWorkMethod: formData.rightToWorkMethod
    });

    // Forward to bridge server
    const bridgeUrl = process.env.DAMEDESK_PART2_WEBHOOK_URL || 'http://localhost:3001/api/candidates/complete-registration';
    
    const response = await fetch(bridgeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.NEXT_PUBLIC_DAMEDESK_API_KEY || 'website-integration'
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      throw new Error(`Bridge server responded with ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Bridge server response:', result);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'Part 2 registration submitted successfully',
        registrationId: result.registrationId
      })
    };

  } catch (error) {
    console.error('❌ Part 2 registration error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: 'Failed to submit Part 2 registration',
        details: error.message
      })
    };
  }
};
