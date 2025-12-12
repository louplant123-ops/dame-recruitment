// Netlify Function to fetch candidate data from DameDesk
const https = require('https');

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://www.damerecruitment.co.uk',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: ''
    };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': 'https://www.damerecruitment.co.uk',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const candidateId = event.queryStringParameters?.id;
    
    if (!candidateId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': 'https://www.damerecruitment.co.uk',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Candidate ID is required' })
      };
    }

    console.log('🔍 Fetching candidate data for ID:', candidateId);

    // Connect directly to DigitalOcean database
    const { Client } = require('pg');
    const client = new Client({
      host: 'damedesk-crm-production-do-user-27348714-0.j.db.ondigitalocean.com',
      port: 25060,
      user: 'doadmin',
      password: 'AVNS_wm_vFxOY5--ftSp64EL',
      database: 'defaultdb',
      ssl: {
        rejectUnauthorized: false
      }
    });

    await client.connect();

    // Query candidate data
    const result = await client.query(
      'SELECT id, name, email, phone, postcode, address, location FROM contacts WHERE id = $1 AND type = $2',
      [candidateId, 'candidate']
    );

    await client.end();

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': 'https://www.damerecruitment.co.uk',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Candidate not found' })
      };
    }

    const candidate = result.rows[0];
    console.log('✅ Candidate data retrieved:', candidate.name);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://www.damerecruitment.co.uk',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(candidate)
    };

  } catch (error) {
    console.error('❌ Error fetching candidate:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': 'https://www.damerecruitment.co.uk',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Failed to fetch candidate data'
      })
    };
  }
};
