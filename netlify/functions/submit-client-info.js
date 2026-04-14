const { getDbClient } = require('./db');

async function updateClientInfo(formId, formData) {
  try {
    console.log('🔄 Updating client info in database...');
    
    const client = getDbClient();
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
      RETURNING id, name, email, company
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
      clientName: contact.name,
      clientEmail: contact.email,
      clientCompany: contact.company,
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

    // Send confirmation email to client (fire-and-forget)
    if (result.clientEmail) {
      sendConfirmationEmail(result).catch(e => console.error('⚠️ Confirmation email failed:', e.message));
    }

    // Notify consultants via telnyx server (fire-and-forget)
    notifyConsultants(result).catch(e => console.error('⚠️ Consultant notification failed:', e.message));

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

// Send confirmation email to the client via Microsoft Graph
async function sendConfirmationEmail(result) {
  const graphClientId = process.env.GRAPH_CLIENT_ID;
  const graphClientSecret = process.env.GRAPH_CLIENT_SECRET;
  const graphTenantId = process.env.GRAPH_TENANT_ID;
  const graphMailbox = process.env.GRAPH_MAILBOX;
  if (!graphClientId || !graphClientSecret || !graphTenantId || !graphMailbox) return;

  const tokenRes = await fetch(`https://login.microsoftonline.com/${graphTenantId}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: graphClientId, client_secret: graphClientSecret, scope: 'https://graph.microsoft.com/.default', grant_type: 'client_credentials' })
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) return;

  const firstName = (result.clientName || '').split(' ')[0];
  const emailHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 20px">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
  <tr><td style="background:#dc2626;padding:28px 40px;text-align:center">
    <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:600">Dame Recruitment</h1>
  </td></tr>
  <tr><td style="padding:36px 40px 20px">
    <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px">Hi ${firstName},</p>
    <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px">Thank you for completing the client information form for <strong>${result.clientCompany || 'your company'}</strong>. We\u2019ve received all your details and will update your account accordingly.</p>
    <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 4px">If you have any questions or need to make changes, please don\u2019t hesitate to get in touch.</p>
    <p style="color:#374151;font-size:15px;line-height:1.6;margin:20px 0 4px">Best regards,</p>
    <p style="color:#374151;font-size:15px;line-height:1.6;margin:0;font-weight:600">Dame Recruitment</p>
    <p style="color:#6b7280;font-size:14px;margin:2px 0 0">0115 888 2233 &middot; info@damerecruitment.co.uk</p>
  </td></tr>
  <tr><td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb">
    <p style="color:#9ca3af;font-size:12px;line-height:1.5;margin:0;text-align:center">
      Dame Recruitment &middot; <a href="https://www.damerecruitment.co.uk" style="color:#9ca3af">www.damerecruitment.co.uk</a> &middot; <a href="https://www.damerecruitment.co.uk/privacy" style="color:#9ca3af">Privacy Policy</a>
    </p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

  await fetch(`https://graph.microsoft.com/v1.0/users/${graphMailbox}/sendMail`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenData.access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: {
        subject: 'Client Information Received \u2014 Dame Recruitment',
        body: { contentType: 'HTML', content: emailHtml },
        toRecipients: [{ emailAddress: { address: result.clientEmail } }]
      }
    })
  });
  console.log(`\u2709\uFE0F Confirmation email sent to ${result.clientEmail}`);
}

// Notify consultants in DameDesk via telnyx server
async function notifyConsultants(result) {
  const serverUrl = process.env.TELNYX_SERVER_URL || process.env.SERVER_URL;
  if (!serverUrl) return;

  await fetch(`${serverUrl}/notifications/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'client_info_completed',
      title: 'Client Info Form Completed',
      message: `${result.clientName || 'A client'} (${result.clientCompany || ''}) has completed their client information form.`,
      icon: 'document-text-outline',
      color: '#F43F5E',
      linkType: 'contact',
      linkId: result.clientId
    })
  });
  console.log(`\uD83D\uDD14 Consultant notification sent for ${result.clientCompany}`);
}
