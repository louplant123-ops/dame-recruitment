// Netlify Function for Dame Recruitment Client Registration
// Matches the pattern of candidate-registration.js

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    console.log('📝 Received client info submission from website');
    
    // Parse the request body
    const body = JSON.parse(event.body);
    
    // Create client registration data with new fields
    const clientData = {
      id: `CLIENT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      companyName: body.companyName,
      companyNumber: body.companyNumber,
      vatNumber: body.vatNumber,
      industry: body.industry,
      companySize: body.companySize,
      website: body.website,
      contactName: body.contactName,
      jobTitle: body.jobTitle,
      email: body.email,
      phone: body.phone,
      accountsContactName: body.accountsContactName,
      accountsContactEmail: body.accountsContactEmail,
      accountsContactPhone: body.accountsContactPhone,
      address: body.address,
      postcode: body.postcode,
      roleTypes: body.roleTypes,
      shiftTypes: body.shiftTypes,
      source: body.source || 'website_client_form',
      status: body.status || 'new_inquiry',
      processed: false
    };
    
    console.log('📝 Client data prepared:', {
      company: clientData.companyName,
      email: clientData.email,
      hasAccountsContact: !!(clientData.accountsContactName || clientData.accountsContactEmail)
    });

    // Forward to DameDesk via webhook (optional)
    await forwardToDameDesk(clientData);
    
    console.log('✅ Client registration processed successfully');
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'Client registration received and queued for processing',
        clientId: clientData.id
      })
    };
    
  } catch (error) {
    console.error('❌ Client registration error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: 'Client registration processing failed',
        details: error.message
      })
    };
  }
};

// Forward client registration to DameDesk (optional webhook)
async function forwardToDameDesk(clientData) {
  const DAMEDESK_WEBHOOK_URL = process.env.DAMEDESK_WEBHOOK_URL;
  
  if (DAMEDESK_WEBHOOK_URL) {
    try {
      const response = await fetch(DAMEDESK_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'netlify-function-key'
        },
        body: JSON.stringify(clientData)
      });
      
      if (response.ok) {
        console.log('✅ Successfully forwarded client data to DameDesk');
        return;
      }
    } catch (error) {
      console.warn('⚠️ Failed to forward to DameDesk:', error.message);
    }
  }
  
  console.log('📧 Client registration queued for processing:', clientData.id);
}
