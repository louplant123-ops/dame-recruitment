const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
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
        'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    console.log('📞 Contact form submission received');
    
    // Parse the form data
    let contactData;
    const contentType = event.headers['content-type'] || '';
    
    if (contentType.includes('application/json')) {
      contactData = JSON.parse(event.body);
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const params = new URLSearchParams(event.body);
      contactData = Object.fromEntries(params);
    } else {
      throw new Error('Unsupported content type');
    }

    console.log('📋 Contact data parsed:', {
      name: contactData.name,
      email: contactData.email,
      company: contactData.company || 'Not provided',
      hasMessage: !!contactData.message
    });

    // Validate required fields
    if (!contactData.name || !contactData.email || !contactData.message) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'Missing required fields: name, email, and message are required' 
        })
      };
    }

    // Check honeypot field (spam protection)
    if (contactData.website) {
      console.log('🚫 Honeypot field filled - blocking spam submission');
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Invalid submission' })
      };
    }

    // Prepare data for DameDesk
    const submissionData = {
      ...contactData,
      submissionType: 'contact',
      timestamp: new Date().toISOString(),
      source: 'website_contact_form'
    };

    // Forward to DameDesk bridge server
    const webhookUrl = process.env.DAMEDESK_WEBHOOK_URL || 'http://localhost:3001/api/contact';
    if (!webhookUrl) {
      throw new Error('DAMEDESK_WEBHOOK_URL not configured');
    }

    console.log('🔗 Forwarding to DameDesk bridge server...');
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.NEXT_PUBLIC_DAMEDESK_API_KEY || 'dame-api-key-2024'
      },
      body: JSON.stringify(submissionData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ DameDesk bridge server error:', response.status, errorText);
      throw new Error(`Bridge server error: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Successfully forwarded to DameDesk:', result);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'Contact form submitted successfully',
        contactId: result.contactId || `CONTACT_${Date.now()}`
      })
    };

  } catch (error) {
    console.error('💥 Contact form error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to process contact form submission'
      })
    };
  }
};
