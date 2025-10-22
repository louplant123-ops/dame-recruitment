const { Client } = require('pg');

// Store job posting in database
async function storeJobInDatabase(jobData, clientData) {
  try {
    console.log('🔄 Storing job posting in database...');
    
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

    // 1. Create or update client contact
    const clientId = `CLIENT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const insertClientQuery = `
      INSERT INTO contacts (
        id, name, email, phone, company, type, status, temperature,
        notes, source, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, 'client', 'active', 'hot', $6, 'website_job_posting', NOW(), NOW())
      ON CONFLICT (id) 
      DO UPDATE SET 
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        company = EXCLUDED.company,
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
      phone: jobData.phone
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
