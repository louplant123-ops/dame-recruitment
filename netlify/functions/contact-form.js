// Contact form with PostgreSQL database integration
const { Client } = require('pg');

// Store contact in database
async function storeInDatabase(contactData) {
  try {
    console.log('🔄 Storing contact in database...');
    
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

    // Insert contact into contacts table
    const insertQuery = `
      INSERT INTO contacts (
        id, name, email, phone, company, type, status, temperature,
        notes, source, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'active', $7, $8, 'website_contact_form', NOW(), NOW())
      ON CONFLICT (id) 
      DO UPDATE SET 
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        company = EXCLUDED.company,
        type = EXCLUDED.type,
        temperature = EXCLUDED.temperature,
        notes = EXCLUDED.notes,
        updated_at = NOW()
      RETURNING id, name, type
    `;

    const values = [
      contactData.contactId,
      contactData.name,
      contactData.email,
      contactData.phone || null,
      contactData.company || null,
      contactData.contactType,
      contactData.temperature,
      contactData.message
    ];

    const result = await client.query(insertQuery, values);
    await client.end();
    
    console.log('✅ Contact stored in database:', result.rows[0]);
    return result.rows[0];
    
  } catch (error) {
    console.error('❌ Database storage error:', error);
    throw error;
  }
}

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
    let contactType = 'prospect'; // Default to prospect for general inquiries
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

    // Save to database
    const dataToStore = {
      contactId: contactId,
      name: contactData.name,
      email: contactData.email,
      phone: contactData.phone || null,
      company: contactData.company || null,
      message: contactData.message,
      contactType: contactType,
      temperature: temperature
    };

    const dbResult = await storeInDatabase(dataToStore);
    console.log('✅ Contact saved to database:', dbResult);

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
        savedToDatabase: true,
        dbRecord: dbResult
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
