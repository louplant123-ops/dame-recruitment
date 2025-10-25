const { Client } = require('pg');

async function getClientData(formId) {
  try {
    console.log('🔄 Fetching client data from database...');
    
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

    // Get client from contacts table
    const query = `
      SELECT 
        id,
        name,
        email,
        company,
        invoice_contact_name,
        invoice_contact_email,
        invoice_address,
        purchase_order_required,
        invoice_format_preference,
        payment_method,
        ppe_required,
        ppe_details,
        site_induction_required,
        health_safety_contact,
        site_access_instructions,
        parking_info,
        interview_process,
        decision_timeframe,
        key_decision_makers,
        preferred_start_dates,
        preferred_contact_method,
        best_contact_times,
        client_info_form_completed
      FROM contacts
      WHERE client_info_form_id = $1
    `;

    const result = await client.query(query, [formId]);
    
    await client.end();
    
    if (result.rows.length === 0) {
      return null;
    }

    const clientData = result.rows[0];
    console.log('✅ Client found:', formId);

    return clientData;
    
  } catch (error) {
    console.error('❌ Database query error:', error);
    throw error;
  }
}

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const formId = event.queryStringParameters?.id;
    
    if (!formId) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Form ID required' })
      };
    }

    console.log('📋 Fetching client data for form:', formId);

    const clientData = await getClientData(formId);
    
    if (!clientData) {
      return {
        statusCode: 404,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Form not found' })
      };
    }

    console.log('✅ Client data retrieved');

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify(clientData)
    };

  } catch (error) {
    console.error('❌ Get client info error:', error);
    
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to retrieve client data',
        details: error.message
      })
    };
  }
};
