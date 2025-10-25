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

    // Update client with form data
    const updateQuery = `
      UPDATE contacts 
      SET 
        invoice_contact_name = $1,
        invoice_contact_email = $2,
        ppe_required = $3,
        ppe_details = $4,
        site_induction_required = $5,
        health_safety_contact = $6,
        site_access_instructions = $7,
        parking_info = $8,
        key_decision_makers = $9,
        preferred_start_dates = $10,
        preferred_contact_method = $11,
        best_contact_times = $12,
        client_info_form_completed = NOW(),
        updated_at = NOW()
      WHERE client_info_form_id = $13
      RETURNING id, name, company
    `;

    const values = [
      formData.invoice_contact_name,
      formData.invoice_contact_email,
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

    // Create invoice contact as a separate contact person if they don't already exist
    if (formData.invoice_contact_name && formData.invoice_contact_email) {
      // Check if contact already exists with this email
      const checkContactQuery = `
        SELECT id FROM contacts 
        WHERE email = $1 AND company = $2
        LIMIT 1
      `;
      const existingContact = await client.query(checkContactQuery, [
        formData.invoice_contact_email,
        contact.company
      ]);

      if (existingContact.rows.length === 0) {
        // Create new contact person for invoicing
        const newContactId = `CONTACT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const createContactQuery = `
          INSERT INTO contacts (
            id, name, email, company, type, position, 
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, 'client', 'Accounts/Finance', NOW(), NOW())
          RETURNING id, name
        `;
        
        const newContactResult = await client.query(createContactQuery, [
          newContactId,
          formData.invoice_contact_name,
          formData.invoice_contact_email,
          contact.company
        ]);
        
        console.log('✅ Invoice contact created:', newContactResult.rows[0]);
      } else {
        console.log('ℹ️ Invoice contact already exists');
      }
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
