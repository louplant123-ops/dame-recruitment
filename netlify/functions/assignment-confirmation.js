const fetch = require('node-fetch');
const { Client } = require('pg');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('📋 Netlify Function: Received assignment confirmation submission');
    
    // Parse the request body
    const formData = JSON.parse(event.body);
    
    console.log('📋 Assignment confirmation data:', {
      assignmentId: formData.assignmentId,
      acceptAssignment: formData.acceptAssignment,
      emergencyContact: formData.emergencyContact,
      digitalSignature: formData.digitalSignature
    });

    // Forward to bridge server
    const bridgeUrl = process.env.DAMEDESK_ASSIGNMENT_WEBHOOK_URL || 'http://localhost:3001/api/assignments/confirm';
    
    const response = await fetch(bridgeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.NEXT_PUBLIC_DAMEDESK_API_KEY || 'website-integration'
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      throw new Error(`Bridge server responded with ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Bridge server response:', result);

    // Create timeline event for assignment confirmation
    if (formData.candidateId) {
      try {
        const dbClient = new Client({
          host: process.env.DB_HOST || 'damedesk-crm-production-do-user-27348714-0.j.db.ondigitalocean.com',
          port: process.env.DB_PORT || 25060,
          database: process.env.DB_NAME || 'defaultdb',
          user: process.env.DB_USER || 'doadmin',
          password: process.env.DB_PASSWORD,
          ssl: { rejectUnauthorized: false },
          connectionTimeoutMillis: 10000
        });

        await dbClient.connect();

        const historyId = `HIST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const insertHistoryQuery = `
          INSERT INTO client_history (
            id, client_id, event_type, event_action, event_date,
            user_name, description, metadata, created_at
          ) VALUES ($1, $2, 'assignment', 'confirmed', NOW(), $3, $4, $5, NOW())
        `;

        const historyValues = [
          historyId,
          formData.candidateId,
          formData.candidateName || 'Candidate',
          `Assignment ${formData.acceptAssignment ? 'accepted' : 'declined'}: ${formData.assignmentDetails || 'Assignment confirmation'}`,
          JSON.stringify({
            assignment_id: formData.assignmentId,
            accepted: formData.acceptAssignment,
            start_date: formData.startDate,
            emergency_contact: formData.emergencyContact,
            signature: formData.digitalSignature,
            confirmed_at: new Date().toISOString()
          })
        ];

        await dbClient.query(insertHistoryQuery, historyValues);
        await dbClient.end();
        console.log('✅ Timeline event created for assignment confirmation');
      } catch (historyError) {
        console.error('⚠️ Failed to create timeline event:', historyError);
        // Continue anyway - assignment confirmation is complete
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'Assignment confirmation submitted successfully',
        assignmentId: result.assignmentId
      })
    };

  } catch (error) {
    console.error('❌ Assignment confirmation error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: 'Failed to submit assignment confirmation',
        details: error.message
      })
    };
  }
};
