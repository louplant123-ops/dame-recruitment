// Netlify Function for Dame Recruitment Website Registration Integration

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': 'https://www.damerecruitment.co.uk',
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
        'Access-Control-Allow-Origin': 'https://www.damerecruitment.co.uk',
        'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    console.log('🌉 Netlify Function: Received registration from website');
    console.log('📥 Raw event body:', event.body);
    console.log('📋 Event headers:', event.headers);
    
    // Parse the request body - handle both JSON and multipart/form-data
    let body;
    const contentType = event.headers['content-type'] || '';
    
    if (contentType.includes('multipart/form-data')) {
      console.log('📦 Processing multipart/form-data');
      // For multipart data, we need to parse it differently
      // Netlify automatically parses multipart data, but we need to handle it
      const formData = event.body;
      
      // Decode base64 if needed
      let decodedBody;
      try {
        decodedBody = Buffer.from(formData, 'base64').toString('utf-8');
        console.log('📝 Decoded multipart body:', decodedBody);
      } catch (decodeError) {
        console.error('❌ Base64 decode error:', decodeError);
        throw new Error('Failed to decode multipart data');
      }
      
      // Parse multipart form data manually
      body = parseMultipartFormData(decodedBody);
      console.log('✅ Successfully parsed multipart body:', body);
    } else {
      // Handle JSON data
      try {
        body = JSON.parse(event.body);
        console.log('✅ Successfully parsed JSON body:', body);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        throw new Error('Invalid JSON in request body');
      }
    }
    
    // Create registration data
    const registrationData = {
      id: `REG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      dateOfBirth: body.dateOfBirth,
      address: body.address,
      postcode: body.postcode,
      rightToWork: body.rightToWork,
      visaType: body.visaType,
      visaExpiry: body.visaExpiry,
      jobTypes: body.jobTypes,
      industries: body.industries,
      experience: body.experience,
      shifts: body.shifts,
      availability: body.availability,
      transport: body.transport,
      drivingLicense: body.drivingLicense === 'true',
      ownVehicle: body.ownVehicle === 'true',
      fltLicense: body.fltLicense === 'true',
      fltTypes: body.fltTypes,
      otherLicenses: body.otherLicenses,
      registrationType: body.registrationType || 'temp',
      source: 'netlify_function',
      processed: false
    };

    console.log('📤 About to forward to DameDesk:', registrationData);
    
    // Forward to your local DameDesk via webhook
    await forwardToDameDesk(registrationData);
    
    console.log('✅ Netlify Function: Registration processed successfully');
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://www.damerecruitment.co.uk',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'Registration received and queued for processing',
        registrationId: registrationData.id
      })
    };
    
  } catch (error) {
    console.error('❌ Netlify Function: Error processing registration:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': 'https://www.damerecruitment.co.uk',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: 'Registration processing failed'
      })
    };
  }
};

// Parse multipart form data
function parseMultipartFormData(body) {
  const data = {};
  
  // Split by boundary and filter out empty parts and boundary markers
  const boundaryMatch = body.match(/------WebKitFormBoundary[a-zA-Z0-9]+/);
  if (!boundaryMatch) return data;
  
  const boundary = boundaryMatch[0];
  const parts = body.split(boundary).filter(part => part.trim() && !part.includes('--'));
  
  parts.forEach(part => {
    // Split part into lines
    const lines = part.split('\r\n');
    
    // Find the Content-Disposition line
    const dispositionLine = lines.find(line => line.includes('Content-Disposition'));
    if (!dispositionLine) return;
    
    // Extract field name
    const nameMatch = dispositionLine.match(/name="([^"]+)"/);
    if (!nameMatch) return;
    
    const fieldName = nameMatch[1];
    
    // Find where the actual content starts (after headers and empty line)
    let contentStartIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === '' && i + 1 < lines.length) {
        contentStartIndex = i + 1;
        break;
      }
    }
    
    if (contentStartIndex === -1) return;
    
    // Get the content (everything after the empty line)
    let value = lines.slice(contentStartIndex).join('\r\n').trim();
    
    // Skip empty values
    if (!value) {
      data[fieldName] = '';
      return;
    }
    
    // Parse JSON strings for arrays
    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        value = JSON.parse(value);
      } catch (e) {
        // Keep as string if JSON parse fails
      }
    }
    
    // Convert string booleans to actual booleans
    if (value === 'true') value = true;
    if (value === 'false') value = false;
    
    data[fieldName] = value;
  });
  
  return data;
}

// Forward registration to your local DameDesk
async function forwardToDameDesk(registrationData) {
  // Option 1: Use ngrok to expose your local DameDesk
  const DAMEDESK_WEBHOOK_URL = process.env.DAMEDESK_WEBHOOK_URL;
  
  console.log('🔗 DAMEDESK_WEBHOOK_URL:', DAMEDESK_WEBHOOK_URL);
  
  if (DAMEDESK_WEBHOOK_URL) {
    try {
      console.log('📡 Attempting to forward to DameDesk...');
      const response = await fetch(DAMEDESK_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'netlify-function-key'
        },
        body: JSON.stringify(registrationData)
      });
      
      console.log('📊 DameDesk response status:', response.status);
      console.log('📊 DameDesk response headers:', response.headers);
      
      if (response.ok) {
        const responseText = await response.text();
        console.log('✅ Successfully forwarded to DameDesk, response:', responseText);
        return;
      } else {
        const errorText = await response.text();
        console.error('❌ DameDesk responded with error:', response.status, errorText);
        throw new Error(`DameDesk error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('⚠️ Failed to forward to DameDesk:', error.message);
      throw error; // Re-throw to trigger the main catch block
    }
  } else {
    console.warn('⚠️ No DAMEDESK_WEBHOOK_URL configured');
    throw new Error('DAMEDESK_WEBHOOK_URL not configured');
  }
}

// Fallback: Send email notification
async function sendEmailNotification(registrationData) {
  // You can integrate with services like:
  // - SendGrid
  // - Mailgun  
  // - Netlify Forms
  // - Zapier webhook
  
  console.log('📧 Would send email notification for registration:', registrationData.id);
  
  // Example: Post to Zapier webhook
  const ZAPIER_WEBHOOK = process.env.ZAPIER_WEBHOOK_URL;
  if (ZAPIER_WEBHOOK) {
    try {
      await fetch(ZAPIER_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      });
    } catch (error) {
      console.warn('Zapier webhook failed:', error.message);
    }
  }
}
