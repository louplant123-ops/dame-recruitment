const { Client } = require('pg');

async function updateClientInfo(formId, formData) {
  try {
    console.log('🔄 Updating client info in database...');
    
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

    // Update client with form data including new fields
    const updateQuery = `
      UPDATE contacts 
      SET 
        company_number = $1,
        vat_number = $2,
        invoice_contact_name = $3,
        invoice_contact_email = $4,
        accounts_contact_name = $5,
        accounts_contact_email = $6,
        accounts_contact_phone = $7,
        ppe_required = $8,
        ppe_details = $9,
        site_induction_required = $10,
        health_safety_contact = $11,
        site_access_instructions = $12,
        parking_info = $13,
        key_decision_makers = $14,
        preferred_start_dates = $15,
        preferred_contact_method = $16,
        best_contact_times = $17,
        client_info_form_completed = NOW(),
        updated_at = NOW()
      WHERE client_info_form_id = $18
      RETURNING id, name, company
    `;

    const values = [
      formData.company_number,
      formData.vat_number,
      formData.invoice_contact_name,
      formData.invoice_contact_email,
      formData.accounts_contact_name,
      formData.accounts_contact_email,
      formData.accounts_contact_phone,
      formData.ppe_required,
      formData.ppe_details,
      formData.site_induction_required,
      formData.health_safety_contact,
      formData.site_access_instructions,
      formData.parking_info,
      formData.key_decision_makers,
      formData.preferred_start_dates,
      formData.preferred_contact_method,
      formData.best_contact_times,
      formId
    ];

    const result = await client.query(updateQuery, values);
    
    if (result.rows.length === 0) {
      throw new Error('Client not found');
    }

    const contact = result.rows[0];
    console.log('✅ Client info updated:', formId);

    // Create task for consultant
    const taskId = `TASK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const insertTaskQuery = `
      INSERT INTO tasks (
        id, title, description, type, priority, status,
        contact_id, due_date, created_at, updated_at
      ) VALUES ($1, $2, $3, 'client_info_completed', 'medium', 'pending', $4, NOW(), NOW(), NOW())
      RETURNING id, title
    `;

    const taskValues = [
      taskId,
      `Client Info Completed: ${contact.company}`,
      `${contact.name} has completed their client information form. Review the operational details.`,
      contact.id
    ];

    const taskResult = await client.query(insertTaskQuery, taskValues);
    console.log('✅ Task created:', taskResult.rows[0]);

    // Create history/timeline event for form completion
    try {
      const historyId = `HIST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const insertHistoryQuery = `
        INSERT INTO client_history (
          id, client_id, event_type, event_action, event_date,
          user_name, description, metadata, created_at
        ) VALUES ($1, $2, 'form', 'completed', NOW(), $3, $4, $5, NOW())
      `;

      const historyValues = [
        historyId,
        contact.id,
        contact.name || 'Client',
        'Client information form completed via website',
        JSON.stringify({
          form_id: formId,
          completed_at: new Date().toISOString(),
          form_type: 'client_info',
          company: contact.company
        })
      ];

      await client.query(insertHistoryQuery, historyValues);
      console.log('✅ Timeline event created for form completion');
    } catch (historyError) {
      console.error('⚠️ Failed to create timeline event:', historyError);
      // Continue anyway - form submission is complete
    }

    await client.end();
    
    return {
      clientId: contact.id,
      taskId: taskId,
      status: 'completed'
    };
    
  } catch (error) {
    console.error('❌ Database update error:', error);
    throw error;
  }
}

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('📋 Processing client info submission');
    
    const data = JSON.parse(event.body);
    const { formId, formData } = data;
    
    console.log('📋 Form ID:', formId);

    // Update client in database
    const result = await updateClientInfo(formId, formData);
    console.log('✅ Client info submitted successfully');

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Client information submitted successfully',
        clientId: result.clientId,
        taskId: result.taskId
      })
    };

  } catch (error) {
    console.error('❌ Client info submission error:', error);
    
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Failed to submit client information',
        details: error.message
      })
    };
  }
};
