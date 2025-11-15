const { Client } = require('pg');

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { email, code } = JSON.parse(event.body);

    if (!email || !code) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email and code are required' }),
      };
    }

    console.log('🔐 Verifying code for email:', email);

    // Connect to database
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
    });

    await client.connect();

    try {
      // Find verification code
      const result = await client.query(
        `SELECT * FROM verification_codes 
         WHERE email = $1 AND code = $2 AND type = $3`,
        [email.toLowerCase(), code, 'holiday_request']
      );

      if (result.rows.length === 0) {
        console.log('❌ Invalid code');
        await client.end();
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid verification code' }),
        };
      }

      const verification = result.rows[0];

    // Check if code has expired
    const expiresAt = new Date(verification.expires_at);
    if (expiresAt < new Date()) {
      console.log('❌ Code expired');
      
      // Delete expired code
      await client.query(
        `DELETE FROM verification_codes WHERE id = $1`,
        [verification.id]
      );
      await client.end();

      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Verification code has expired. Please request a new one.' }),
      };
    }

      console.log('✅ Code verified');

      // Get candidate data
      const candidateResult = await client.query(
        `SELECT id, name, email, phone, type FROM contacts WHERE id = $1`,
        [verification.candidate_id]
      );

      if (candidateResult.rows.length === 0) {
        await client.end();
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Candidate not found' }),
        };
      }

      const candidate = candidateResult.rows[0];

      // Delete used verification code
      await client.query(
        `DELETE FROM verification_codes WHERE id = $1`,
        [verification.id]
      );

      console.log('✅ Returning candidate data:', candidate.name);

      await client.end();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true,
          candidate: {
            id: candidate.id,
            name: candidate.name,
            email: candidate.email,
            phone: candidate.phone
          }
        }),
      };

    } catch (dbError) {
      console.error('❌ Database error:', dbError);
      await client.end();
      throw dbError;
    }

  } catch (error) {
    console.error('❌ Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
