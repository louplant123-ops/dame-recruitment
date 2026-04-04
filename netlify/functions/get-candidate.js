// Netlify Function to fetch candidate data from DameDesk
const crypto = require('crypto');
const { getDbClient } = require('./db');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://www.damerecruitment.co.uk',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const apiKey = event.headers['x-api-key'];
  const expectedKey = process.env.WEBSITE_API_KEY;
  if (!expectedKey || !apiKey || !crypto.timingSafeEqual(Buffer.from(apiKey), Buffer.from(expectedKey))) {
    return {
      statusCode: 403,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Forbidden' })
    };
  }

  try {
    const candidateId = event.queryStringParameters?.id;
    
    if (!candidateId) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Candidate ID is required' })
      };
    }

    const client = getDbClient();
    await client.connect();

    const result = await client.query(
      'SELECT id, name, email, phone, postcode, address, location FROM contacts WHERE id = $1 AND type = $2',
      [candidateId, 'candidate']
    );

    await client.end();

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Candidate not found' })
      };
    }

    const candidate = result.rows[0];

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(candidate)
    };

  } catch (error) {
    console.error('Error fetching candidate:', error);
    
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Failed to fetch candidate data' })
    };
  }
};
