exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('📥 Received permanent registration request');
    console.log('Headers:', event.headers);
    console.log('Content-Type:', event.headers['content-type']);

    let registrationData = {};

    // Parse multipart/form-data
    if (event.headers['content-type']?.includes('multipart/form-data')) {
      const boundary = event.headers['content-type'].split('boundary=')[1];
      if (!boundary) {
        throw new Error('No boundary found in multipart data');
      }

      const parts = event.body.split(`--${boundary}`);
      
      for (const part of parts) {
        if (part.includes('Content-Disposition: form-data')) {
          const nameMatch = part.match(/name="([^"]+)"/);
          if (nameMatch) {
            const fieldName = nameMatch[1];
            
            // Extract content after headers (after \r\n\r\n)
            const contentStart = part.indexOf('\r\n\r\n');
            if (contentStart !== -1) {
              let fieldValue = part.substring(contentStart + 4);
              
              // Remove trailing boundary markers and whitespace
              fieldValue = fieldValue.replace(/\r\n--.*$/, '').trim();
              
              if (fieldValue) {
                registrationData[fieldName] = fieldValue;
              }
            }
          }
        }
      }
    } else {
      // Parse JSON data
      registrationData = JSON.parse(event.body);
    }

    console.log('📋 Parsed registration data:', Object.keys(registrationData));

    // Validate required fields for permanent registration
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'careerObjective', 'expectedSalary'];
    const missingFields = requiredFields.filter(field => !registrationData[field]);
    
    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`
        })
      };
    }

    // Add registration metadata
    registrationData.registrationType = 'permanent';
    registrationData.timestamp = new Date().toISOString();
    registrationData.source = 'website_permanent_registration';

    // Forward to DameDesk bridge server
    const webhookUrl = process.env.DAMEDESK_WEBHOOK_URL;
    if (!webhookUrl) {
      throw new Error('DAMEDESK_WEBHOOK_URL environment variable not set');
    }

    console.log('🔗 Forwarding to DameDesk:', webhookUrl);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'dame-api-key-2024'
      },
      body: JSON.stringify(registrationData)
    });

    if (!response.ok) {
      throw new Error(`DameDesk webhook failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ DameDesk response:', result);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Permanent registration submitted successfully',
        candidateId: result.candidateId
      })
    };

  } catch (error) {
    console.error('❌ Permanent registration error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Registration failed. Please try again.',
        details: error.message
      })
    };
  }
};
