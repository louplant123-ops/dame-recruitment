// Simple contact form that works without database - for testing
exports.handler = async (event, context) => {
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
      inquiryType: contactData.inquiryType,
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

    // Generate contact ID
    const contactId = `CONTACT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Determine routing based on inquiry type
    let contactType = 'contact';
    let temperature = 'warm';
    let message = 'General contact received';
    
    if (contactData.inquiryType === 'job_seeker') {
      contactType = 'candidate';
      temperature = 'warm';
      message = 'Job seeker contact - should go to Candidates page';
    } else if (contactData.inquiryType === 'employer') {
      contactType = 'prospect';
      temperature = 'hot';
      message = 'Employer inquiry - should go to Prospects page';
    }

    console.log('🎯 Contact routing:', {
      inquiryType: contactData.inquiryType,
      contactType: contactType,
      temperature: temperature
    });

    // TODO: Save to database (currently disabled for testing)
    console.log('💾 Database save skipped - contact would be saved as:', {
      contactId: contactId,
      type: contactType,
      temperature: temperature,
      source: 'website_contact_form'
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'Contact form submitted successfully',
        contactId: contactId,
        contactType: contactType,
        routingMessage: message,
        note: 'Database save temporarily disabled - contact logged in function logs'
      })
    };

  } catch (error) {
    console.error('💥 Contact form error:', {
      message: error.message,
      stack: error.stack
    });
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to process contact form submission',
        details: error.message
      })
    };
  }
};
