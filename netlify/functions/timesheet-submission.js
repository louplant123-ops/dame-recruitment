const { Client } = require('pg');

// Store timesheet submission in database
async function storeTimesheetInDatabase(timesheetData) {
  try {
    console.log('🔄 Storing timesheet in database...');
    
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

    // 1. Create timesheet record
    const timesheetId = `TIMESHEET_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const insertTimesheetQuery = `
      INSERT INTO timesheets (
        id, client_id, week_ending_date, status, submitted_by, submitted_at,
        total_hours, total_workers, comments, created_at, updated_at
      ) VALUES ($1, $2, $3, 'submitted', $4, NOW(), $5, $6, $7, NOW(), NOW())
      RETURNING id, status, total_hours
    `;

    const timesheetValues = [
      timesheetId,
      timesheetData.clientId,
      timesheetData.weekEnding,
      timesheetData.submittedBy || 'client',
      timesheetData.totals.totalHours,
      timesheetData.workers.length,
      timesheetData.clientNotes || ''
    ];

    const timesheetResult = await client.query(insertTimesheetQuery, timesheetValues);
    console.log('✅ Timesheet created:', timesheetResult.rows[0]);

    // 2. Create timesheet entries for each worker
    const entryIds = [];
    for (const worker of timesheetData.workers) {
      for (const entry of worker.entries) {
        const entryId = `ENTRY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const insertEntryQuery = `
          INSERT INTO timesheet_entries (
            id, timesheet_id, worker_name, worker_id, date,
            hours_worked, hourly_rate, notes, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
          RETURNING id
        `;

        const entryValues = [
          entryId,
          timesheetId,
          worker.name,
          worker.id,
          entry.date,
          entry.hours,
          entry.charge_rate || 0,
          entry.client_notes || ''
        ];

        const entryResult = await client.query(insertEntryQuery, entryValues);
        entryIds.push(entryResult.rows[0].id);
      }
    }
    console.log(`✅ Created ${entryIds.length} timesheet entries`);

    // 3. Check if client has assigned consultant
    const checkAssignmentQuery = `
      SELECT id, name FROM contacts WHERE id = $1 LIMIT 1
    `;
    const clientResult = await client.query(checkAssignmentQuery, [timesheetData.clientId]);
    const clientName = clientResult.rows[0]?.name || 'Unknown Client';

    // 4. Create approval task (leave unassigned for now - can add consultant assignment later)
    const taskId = `TASK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const insertTaskQuery = `
      INSERT INTO tasks (
        id, title, description, type, priority, status, assigned_to,
        contact_id, due_date, created_at, updated_at
      ) VALUES ($1, $2, $3, 'timesheet_approval', 'high', 'pending', NULL, $4, NOW() + INTERVAL '1 day', NOW(), NOW())
      RETURNING id, title
    `;

    const taskValues = [
      taskId,
      `Approve Timesheet: ${clientName} - Week ${timesheetData.weekEnding}`,
      `Timesheet submitted by ${clientName}. Total hours: ${timesheetData.totals.totalHours}. Workers: ${timesheetData.workers.length}. Review and approve.`,
      timesheetData.clientId
    ];

    const taskResult = await client.query(insertTaskQuery, taskValues);
    console.log('✅ Approval task created:', taskResult.rows[0]);

    // Create timeline event for timesheet submission
    try {
      const historyId = `HIST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const insertHistoryQuery = `
        INSERT INTO client_history (
          id, client_id, event_type, event_action, event_date,
          user_name, description, metadata, created_at
        ) VALUES ($1, $2, 'timesheet', 'submitted', NOW(), $3, $4, $5, NOW())
      `;

      const historyValues = [
        historyId,
        timesheetData.clientId,
        timesheetData.submittedBy || clientName,
        `Timesheet submitted for week ending ${timesheetData.weekEnding}`,
        JSON.stringify({
          timesheet_id: timesheetId,
          week_ending: timesheetData.weekEnding,
          total_hours: timesheetData.totals.totalHours,
          total_workers: timesheetData.workers.length,
          submitted_at: new Date().toISOString()
        })
      ];

      await client.query(insertHistoryQuery, historyValues);
      console.log('✅ Timeline event created for timesheet submission');
    } catch (historyError) {
      console.error('⚠️ Failed to create timeline event:', historyError);
      // Continue anyway - timesheet submission is complete
    }

    await client.end();
    
    return {
      timesheetId: timesheetId,
      entryCount: entryIds.length,
      taskId: taskId,
      status: 'submitted'
    };
    
  } catch (error) {
    console.error('❌ Database storage error:', error);
    throw error;
  }
}

exports.handler = async (event, context) => {
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

  try {
    console.log('📋 Timesheet submission received');
    
    // Parse the form data
    let timesheetData;
    const contentType = event.headers['content-type'] || '';
    
    if (contentType.includes('application/json')) {
      timesheetData = JSON.parse(event.body);
    } else {
      throw new Error('Unsupported content type - must be application/json');
    }

    console.log('📊 Timesheet data:', {
      clientId: timesheetData.clientId,
      weekEnding: timesheetData.weekEnding,
      workers: timesheetData.workers?.length,
      totalHours: timesheetData.totals?.totalHours
    });

    // Validate required fields
    if (!timesheetData.clientId || !timesheetData.weekEnding || !timesheetData.workers) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'Missing required fields: clientId, weekEnding, and workers are required' 
        })
      };
    }

    // Save to database
    const result = await storeTimesheetInDatabase(timesheetData);
    console.log('✅ Timesheet saved to database:', result);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'Timesheet submitted successfully',
        timesheetId: result.timesheetId,
        entryCount: result.entryCount,
        taskId: result.taskId,
        status: result.status,
        savedToDatabase: true
      })
    };

  } catch (error) {
    console.error('💥 Timesheet submission error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to process timesheet submission',
        details: error.message
      })
    };
  }
};
