const { Client } = require('pg');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('📊 Connected to database');

    const data = JSON.parse(event.body);
    const {
      candidateId,
      nationalityCategory,
      rightToWorkMethod,
      shareCode,
      dateOfBirth
    } = data;

    console.log('📋 Creating RTW check:', {
      candidateId,
      nationalityCategory,
      rightToWorkMethod
    });

    // Generate RTW check ID
    const rtwCheckId = `RTW_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Determine initial status
    let status = 'pending';
    if (rightToWorkMethod === 'video_call') {
      status = 'scheduled'; // Will need to be scheduled
    }

    // Create RTW check record
    const insertQuery = `
      INSERT INTO rtw_checks (
        id, contact_id, check_type, nationality_category, status,
        share_code, share_code_dob, statutory_excuse,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *
    `;

    const result = await client.query(insertQuery, [
      rtwCheckId,
      candidateId,
      rightToWorkMethod,
      nationalityCategory,
      status,
      shareCode || null,
      dateOfBirth || null,
      false // Will be set to true when verified
    ]);

    console.log('✅ RTW check created:', result.rows[0]);

    // Update contact with RTW status
    await client.query(
      `UPDATE contacts 
       SET rtw_status = $1, 
           rtw_check_id = $2,
           nationality_category = $3,
           rtw_last_checked = NOW()
       WHERE id = $4`,
      [status, rtwCheckId, nationalityCategory, candidateId]
    );

    console.log('✅ Contact RTW status updated');

    // Send notification based on check type
    let nextSteps = '';
    if (rightToWorkMethod === 'yoti_digital') {
      nextSteps = 'Yoti verification link will be sent via email';
      // TODO: Trigger Yoti session creation when API keys are available
    } else if (rightToWorkMethod === 'video_call') {
      nextSteps = 'Team will contact candidate to schedule video verification';
      // TODO: Trigger notification to recruitment team
    } else if (rightToWorkMethod === 'share_code') {
      nextSteps = 'Share code submitted for manual verification';
      // TODO: Trigger notification to recruitment team
    }

    await client.end();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        rtwCheckId,
        status,
        nextSteps,
        message: 'RTW check created successfully'
      })
    };

  } catch (error) {
    console.error('❌ Error creating RTW check:', error);
    
    try {
      await client.end();
    } catch (e) {
      console.error('Error closing connection:', e);
    }

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
