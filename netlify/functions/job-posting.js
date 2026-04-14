const { getDbClient } = require('./db');

// Store job posting in database
async function storeJobInDatabase(jobData, clientData) {
  try {
    console.log('🔄 Storing job posting in database...');
    
    const client = getDbClient();
    await client.connect();
    console.log('✅ Connected to database');

    // 1. Create or update client contact
    const clientId = `CLIENT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const insertClientQuery = `
      INSERT INTO contacts (
        id, name, email, phone, company, type, status, temperature,
        company_number, vat_number,
        accounts_contact_name, accounts_contact_email, accounts_contact_phone,
        notes, source, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, 'client', 'active', 'hot', $6, $7, $8, $9, $10, $11, 'website_job_posting', NOW(), NOW())
      ON CONFLICT (id) 
      DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        company = EXCLUDED.company,
        company_number = EXCLUDED.company_number,
        vat_number = EXCLUDED.vat_number,
        accounts_contact_name = EXCLUDED.accounts_contact_name,
        accounts_contact_email = EXCLUDED.accounts_contact_email,
        accounts_contact_phone = EXCLUDED.accounts_contact_phone,
        temperature = 'hot',
        notes = EXCLUDED.notes,
        updated_at = NOW()
      RETURNING id, name, type
    `;

    const clientValues = [
      clientId,
      clientData.contactName,
      clientData.email,
      clientData.phone || null,
      clientData.companyName,
      clientData.companyNumber || null,
      clientData.vatNumber || null,
      clientData.accountsContactName || null,
      clientData.accountsContactEmail || null,
      clientData.accountsContactPhone || null,
      `Job posting: ${jobData.jobTitle} - ${jobData.urgency} urgency`
    ];

    const clientResult = await client.query(insertClientQuery, clientValues);
    const savedClientId = clientResult.rows[0].id;
    console.log('✅ Client saved:', clientResult.rows[0]);

    // 2. Create job record
    const jobId = `JOB_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const insertJobQuery = `
      INSERT INTO jobs (
        id, title, client_id, description, location, job_type, status,
        requirements, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'open', $7, NOW(), NOW())
      RETURNING id, title, status
    `;

    const jobValues = [
      jobId,
      jobData.jobTitle,
      savedClientId,
      jobData.description,
      jobData.location,
      jobData.jobType || 'temporary',
      `Urgency: ${jobData.urgency}`
    ];

    const jobResult = await client.query(insertJobQuery, jobValues);
    console.log('✅ Job created:', jobResult.rows[0]);

    // 3. Leave task unassigned for manager to assign
    const assignedConsultant = null;

    // 4. Create follow-up task
    const taskId = `TASK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const insertTaskQuery = `
      INSERT INTO tasks (
        id, title, description, type, priority, status, assigned_to,
        contact_id, job_id, due_date, created_at, updated_at
      ) VALUES ($1, $2, $3, 'follow_up', 'high', 'pending', $4, $5, $6, NOW() + INTERVAL '1 day', NOW(), NOW())
      RETURNING id, title, assigned_to
    `;

    const taskValues = [
      taskId,
      `Follow up: ${clientData.companyName} - ${jobData.jobTitle}`,
      `New job posting from ${clientData.companyName}. Contact: ${clientData.contactName} (${clientData.email}). Urgency: ${jobData.urgency}`,
      assignedConsultant,
      savedClientId,
      jobId
    ];

    const taskResult = await client.query(insertTaskQuery, taskValues);
    console.log('✅ Task created:', taskResult.rows[0]);

    await client.end();
    
    return {
      clientId: savedClientId,
      jobId: jobId,
      taskId: taskId,
      assignedTo: assignedConsultant
    };
    
  } catch (error) {
    console.error('❌ Database storage error:', error);
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
    console.log('💼 Job posting form submission received');
    
    // Parse the form data
    let jobData;
    const contentType = event.headers['content-type'] || '';
    
    if (contentType.includes('application/json')) {
      jobData = JSON.parse(event.body);
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const params = new URLSearchParams(event.body);
      jobData = Object.fromEntries(params);
    } else {
      throw new Error('Unsupported content type');
    }

    console.log('📋 Job posting data parsed:', {
      companyName: jobData.companyName,
      jobTitle: jobData.jobTitle,
      jobType: jobData.jobType,
      location: jobData.location,
      contactName: jobData.contactName,
      email: jobData.email
    });

    // Validate required fields
    const requiredFields = ['companyName', 'contactName', 'email', 'jobTitle', 'jobType', 'location', 'description', 'urgency'];
    const missingFields = requiredFields.filter(field => !jobData[field]);
    
    if (missingFields.length > 0) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        })
      };
    }

    // Separate client and job data
    const clientData = {
      companyName: jobData.companyName,
      contactName: jobData.contactName,
      email: jobData.email,
      phone: jobData.phone,
      companyNumber: jobData.companyNumber,
      vatNumber: jobData.vatNumber,
      accountsContactName: jobData.accountsContactName,
      accountsContactEmail: jobData.accountsContactEmail,
      accountsContactPhone: jobData.accountsContactPhone
    };

    const jobPostingData = {
      jobTitle: jobData.jobTitle,
      jobType: jobData.jobType,
      location: jobData.location,
      description: jobData.description,
      urgency: jobData.urgency
    };

    // Save to database
    const result = await storeJobInDatabase(jobPostingData, clientData);
    console.log('✅ Job posting saved to database:', result);

    // Send confirmation email to client (fire-and-forget)
    sendConfirmationEmail(clientData, jobPostingData, result).catch(e => console.error('⚠️ Confirmation email failed:', e.message));

    // Notify consultants via telnyx server (fire-and-forget)
    notifyConsultants(clientData, jobPostingData, result).catch(e => console.error('⚠️ Consultant notification failed:', e.message));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'Job posting submitted successfully',
        jobId: result.jobId,
        clientId: result.clientId,
        taskId: result.taskId,
        assignedTo: result.assignedTo,
        savedToDatabase: true
      })
    };

  } catch (error) {
    console.error('💥 Job posting error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to process job posting submission'
      })
    };
  }
};

// Send confirmation email to the client via Microsoft Graph
async function sendConfirmationEmail(clientData, jobData, result) {
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

  const firstName = (clientData.contactName || '').split(' ')[0];
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
    <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px">Thank you for posting a vacancy with Dame Recruitment. We\u2019ve received your job details and a member of our team will be in touch within 24 hours to discuss your requirements and begin sourcing candidates.</p>
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:16px 20px;margin:0 0 24px">
      <p style="color:#6b7280;font-size:13px;margin:0 0 8px"><strong>Reference:</strong> ${result.jobId}</p>
      <p style="color:#6b7280;font-size:13px;margin:0 0 8px"><strong>Company:</strong> ${clientData.companyName}</p>
      <p style="color:#6b7280;font-size:13px;margin:0 0 8px"><strong>Role:</strong> ${jobData.jobTitle}</p>
      <p style="color:#6b7280;font-size:13px;margin:0 0 8px"><strong>Type:</strong> ${jobData.jobType}</p>
      <p style="color:#6b7280;font-size:13px;margin:0"><strong>Location:</strong> ${jobData.location}</p>
    </div>
    <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 4px">If you have any questions in the meantime, please don\u2019t hesitate to get in touch.</p>
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
        subject: 'Vacancy Received \u2014 Dame Recruitment',
        body: { contentType: 'HTML', content: emailHtml },
        toRecipients: [{ emailAddress: { address: clientData.email } }]
      }
    })
  });
  console.log(`\u2709\uFE0F Confirmation email sent to ${clientData.email}`);
}

// Notify consultants in DameDesk via telnyx server
async function notifyConsultants(clientData, jobData, result) {
  const serverUrl = process.env.TELNYX_SERVER_URL || process.env.SERVER_URL;
  if (!serverUrl) return;

  await fetch(`${serverUrl}/notifications/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'job_posting',
      title: 'New Job Posting Received',
      message: `${clientData.companyName} has posted a vacancy: ${jobData.jobTitle} (${jobData.jobType}) in ${jobData.location}. Urgency: ${jobData.urgency}`,
      icon: 'briefcase-outline',
      color: '#DC2626',
      linkType: 'job',
      linkId: result.jobId
    })
  });
  console.log(`\uD83D\uDD14 Consultant notification sent for ${clientData.companyName} - ${jobData.jobTitle}`);
}
