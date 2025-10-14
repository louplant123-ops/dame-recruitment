const { Client } = require('pg');

// Store contact in database with smart routing based on inquiry type
async function storeContactInDatabase(contactData) {
  try {
    console.log('🔄 Storing contact in database...');
    
    const client = new Client({
      host: process.env.DB_HOST || 'damedesk-crm-production-do-user-27348714-0.j.db.ondigitalocean.com',
      port: process.env.DB_PORT || 25060,
      database: process.env.DB_NAME || 'defaultdb',
      user: process.env.DB_USER || 'doadmin',
      password: process.env.DB_PASSWORD,
      ssl: {
        rejectUnauthorized: false
      },
      connectionTimeoutMillis: 10000
    });

    await client.connect();
    console.log('✅ Connected to database');

    // Test database connection first
    const testResult = await client.query('SELECT NOW() as current_time');
    console.log('✅ Database test successful:', testResult.rows[0]);

    const contactId = `CONTACT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    // Route based on inquiry type
    if (contactData.inquiryType === 'job_seeker') {
      // Save as candidate
      console.log('👤 Routing job seeker to candidates table');
      
      const insertQuery = `
        INSERT INTO contacts (
          id, name, email, company, phone, location, skills, notes, 
          type, source, created_at, updated_at, status, temperature
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id, name, email
      `;
      
      const values = [
        contactId,
        contactData.name,
        contactData.email,
        contactData.company || '',
        '', // phone - not collected in contact form
        '', // location - not collected in contact form
        '', // skills - not collected in contact form
        `Contact form message: ${contactData.message}`,
        'candidate',
        'website_contact_form',
        timestamp,
        timestamp,
        'new',
        'warm'
      ];

      console.log('📝 Executing insert query for job seeker...');
      const result = await client.query(insertQuery, values);
      await client.end();
      console.log('✅ Job seeker contact saved successfully:', result.rows[0]);
      
      return {
        contactId: result.rows[0].id,
        type: 'candidate',
        message: 'Job seeker contact saved to candidates'
      };

    } else if (contactData.inquiryType === 'employer') {
      // Save as prospect/client
      console.log('🏢 Routing employer to prospects table');
      
      const insertQuery = `
        INSERT INTO contacts (
          id, name, email, company, phone, location, skills, notes, 
          type, source, created_at, updated_at, status, temperature
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id, name, email
      `;
      
      const values = [
        contactId,
        contactData.name,
        contactData.email,
        contactData.company || '',
        '', // phone
        '', // location
        '', // skills
        `Employer inquiry: ${contactData.message}`,
        'prospect', // Mark as prospect for hiring inquiries
        'website_contact_form',
        timestamp,
        timestamp,
        'new',
        'hot' // Employers are hot leads
      ];

      const result = await client.query(insertQuery, values);
      await client.end();
      
      return {
        contactId: result.rows[0].id,
        type: 'prospect',
        message: 'Employer contact saved to prospects'
      };

    } else {
      // General inquiry - save as general contact
      console.log('📞 Routing general inquiry to contacts');
      
      const insertQuery = `
        INSERT INTO contacts (
          id, name, email, company, phone, location, skills, notes, 
          type, source, created_at, updated_at, status, temperature
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id, name, email
      `;
      
      const values = [
        contactId,
        contactData.name,
        contactData.email,
        contactData.company || '',
        '', // phone
        '', // location
        '', // skills
        `General inquiry: ${contactData.message}`,
        'contact', // General contact type
        'website_contact_form',
        timestamp,
        timestamp,
        'new',
        'warm'
      ];

      const result = await client.query(insertQuery, values);
      await client.end();
      
      return {
        contactId: result.rows[0].id,
        type: 'contact',
        message: 'General contact saved'
      };
    }
    
  } catch (error) {
    console.error('❌ Database storage error:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack
    });
    throw error;
  }
}

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

    // Store contact in database with smart routing
    console.log('🎯 Processing contact with smart routing based on inquiry type:', contactData.inquiryType);
    
    const result = await storeContactInDatabase(contactData);
    console.log('✅ Contact processed successfully:', result);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'Contact form submitted successfully',
        contactId: result.contactId,
        contactType: result.type,
        routingMessage: result.message
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
