const { getDbClient } = require('./db');

const RAILWAY_URL = process.env.RAILWAY_BACKEND_URL || 'https://damedesk-production.up.railway.app';
const SERVER_API_KEY = process.env.SERVER_API_KEY || '';

async function notifyConsultants({ clientId, clientName, weekEnding, totalHours, workerCount }) {
  try {
    await fetch(`${RAILWAY_URL}/notifications/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(SERVER_API_KEY ? { 'x-api-key': SERVER_API_KEY } : {}),
      },
      body: JSON.stringify({
        type: 'timesheet_submitted',
        title: `Timesheet submitted — ${clientName}`,
        message: `${clientName} submitted their timesheet for week ending ${weekEnding} (${totalHours} hours, ${workerCount} worker${workerCount === 1 ? '' : 's'}).`,
        icon: 'document-text-outline',
        color: '#3B82F6',
        linkType: 'contact',
        linkId: clientId,
      }),
    });
  } catch (err) {
    console.warn('⚠️ Consultant notification failed (non-critical):', err.message);
  }
}

async function createTimesheetActivity(client, {
  clientId,
  clientName,
  timesheetId,
  weekEnding,
  totalHours,
  workerCount,
  submittedBy,
}) {
  try {
    const activityId = `ACT_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    await client.query(
      `INSERT INTO activities (
        id, subject_type, subject_id, type, summary, details, channel, direction, user_name, created_at
      ) VALUES ($1, 'client', $2, 'timesheet_submitted', $3, $4, 'portal', 'inbound', $5, NOW())`,
      [
        activityId,
        clientId,
        `Timesheet submitted for week ending ${weekEnding}`,
        JSON.stringify({
          timesheet_id: timesheetId,
          client_name: clientName,
          week_ending: weekEnding,
          total_hours: totalHours,
          total_workers: workerCount,
          submitted_by: submittedBy,
        }),
        submittedBy || clientName,
      ]
    );
    console.log('✅ Activity created for timesheet submission');
  } catch (activityError) {
    console.error('⚠️ Failed to create activity:', activityError.message);
  }
}

async function insertTimesheetEntries(client, timesheetId, workers) {
  const entryIds = [];
  for (const worker of workers) {
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
        entry.client_notes || '',
      ];

      const entryResult = await client.query(insertEntryQuery, entryValues);
      entryIds.push(entryResult.rows[0].id);
    }
  }
  return entryIds;
}

// Store timesheet submission in database
async function storeTimesheetInDatabase(timesheetData) {
  const client = getDbClient();
  await client.connect();
  console.log('✅ Connected to database');

  try {
    const clientResult = await client.query(
      `SELECT id, name, company, owner_user_id FROM contacts WHERE id = $1 LIMIT 1`,
      [timesheetData.clientId]
    );
    const clientRow = clientResult.rows[0];
    const clientName = clientRow?.company || clientRow?.name || 'Unknown Client';
    const consultantId = clientRow?.owner_user_id || null;

    let timesheetId = timesheetData.timesheetId || null;
    let existingTimesheet = null;

    if (timesheetId) {
      const existingResult = await client.query(
        `SELECT id, client_id, week_ending_date, status, submitted_at, submitted_by, total_hours
         FROM timesheets WHERE id = $1 LIMIT 1`,
        [timesheetId]
      );
      existingTimesheet = existingResult.rows[0] || null;

      if (!existingTimesheet) {
        throw new Error('Timesheet not found');
      }
      if (existingTimesheet.client_id !== timesheetData.clientId) {
        throw new Error('Timesheet does not belong to this client');
      }
      if (['submitted', 'approved', 'invoiced'].includes(existingTimesheet.status)) {
        const hasClientHours = parseFloat(existingTimesheet.total_hours || 0) > 0;
        const clientSubmitted =
          existingTimesheet.submitted_by &&
          existingTimesheet.submitted_by !== 'consultant';
        if (hasClientHours || clientSubmitted || ['approved', 'invoiced'].includes(existingTimesheet.status)) {
          return {
            duplicate: true,
            timesheetId: existingTimesheet.id,
            submittedAt: existingTimesheet.submitted_at,
            status: existingTimesheet.status,
          };
        }
      }
    } else {
      const duplicateResult = await client.query(
        `SELECT id, status, submitted_at
         FROM timesheets
         WHERE client_id = $1
           AND week_ending_date::date = $2::date
           AND status IN ('submitted', 'approved', 'invoiced')
         ORDER BY submitted_at DESC NULLS LAST
         LIMIT 1`,
        [timesheetData.clientId, timesheetData.weekEnding]
      );
      if (duplicateResult.rows.length > 0) {
        const dup = duplicateResult.rows[0];
        return {
          duplicate: true,
          timesheetId: dup.id,
          submittedAt: dup.submitted_at,
          status: dup.status,
        };
      }
    }

    if (existingTimesheet) {
      await client.query(
        `UPDATE timesheets
         SET status = 'submitted',
             submitted_by = $1,
             submitted_at = NOW(),
             total_hours = $2,
             total_workers = $3,
             comments = $4,
             updated_at = NOW()
         WHERE id = $5`,
        [
          timesheetData.submittedBy || 'client',
          timesheetData.totals.totalHours,
          timesheetData.workers.length,
          timesheetData.clientNotes || '',
          timesheetId,
        ]
      );
      await client.query(`DELETE FROM timesheet_entries WHERE timesheet_id = $1`, [timesheetId]);
      console.log('✅ Updated existing timesheet:', timesheetId);
    } else {
      timesheetId = `TIMESHEET_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await client.query(
        `INSERT INTO timesheets (
          id, client_id, week_ending_date, status, submitted_by, submitted_at,
          total_hours, total_workers, comments, created_at, updated_at
        ) VALUES ($1, $2, $3, 'submitted', $4, NOW(), $5, $6, $7, NOW(), NOW())`,
        [
          timesheetId,
          timesheetData.clientId,
          timesheetData.weekEnding,
          timesheetData.submittedBy || 'client',
          timesheetData.totals.totalHours,
          timesheetData.workers.length,
          timesheetData.clientNotes || '',
        ]
      );
      console.log('✅ Timesheet created:', timesheetId);
    }

    const entryIds = await insertTimesheetEntries(client, timesheetId, timesheetData.workers);
    console.log(`✅ Created ${entryIds.length} timesheet entries`);

    const taskId = `TASK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await client.query(
      `INSERT INTO tasks (
        id, title, description, type, priority, status, assigned_to,
        contact_id, due_date, created_at, updated_at
      ) VALUES ($1, $2, $3, 'timesheet_approval', 'high', 'pending', $4, $5, NOW() + INTERVAL '1 day', NOW(), NOW())
      RETURNING id, title`,
      [
        taskId,
        `Approve Timesheet: ${clientName} - Week ${timesheetData.weekEnding}`,
        `Timesheet submitted by ${timesheetData.submittedBy || clientName}. Total hours: ${timesheetData.totals.totalHours}. Workers: ${timesheetData.workers.length}. Review and approve.`,
        consultantId,
        timesheetData.clientId,
      ]
    );
    console.log('✅ Approval task created:', taskId);

    try {
      const historyId = `HIST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await client.query(
        `INSERT INTO client_history (
          id, client_id, event_type, event_action, event_date,
          user_name, description, metadata, created_at
        ) VALUES ($1, $2, 'timesheet', 'submitted', NOW(), $3, $4, $5, NOW())`,
        [
          historyId,
          timesheetData.clientId,
          timesheetData.submittedBy || clientName,
          `Timesheet submitted for week ending ${timesheetData.weekEnding}`,
          JSON.stringify({
            timesheet_id: timesheetId,
            week_ending: timesheetData.weekEnding,
            total_hours: timesheetData.totals.totalHours,
            total_workers: timesheetData.workers.length,
            submitted_at: new Date().toISOString(),
          }),
        ]
      );
      console.log('✅ Timeline event created for timesheet submission');
    } catch (historyError) {
      console.error('⚠️ Failed to create timeline event:', historyError.message);
    }

    await createTimesheetActivity(client, {
      clientId: timesheetData.clientId,
      clientName,
      timesheetId,
      weekEnding: timesheetData.weekEnding,
      totalHours: timesheetData.totals.totalHours,
      workerCount: timesheetData.workers.length,
      submittedBy: timesheetData.submittedBy,
    });

    await notifyConsultants({
      clientId: timesheetData.clientId,
      clientName,
      weekEnding: timesheetData.weekEnding,
      totalHours: timesheetData.totals.totalHours,
      workerCount: timesheetData.workers.length,
    });

    const submittedAtResult = await client.query(
      `SELECT submitted_at FROM timesheets WHERE id = $1`,
      [timesheetId]
    );

    return {
      timesheetId,
      entryCount: entryIds.length,
      taskId,
      status: 'submitted',
      submittedAt: submittedAtResult.rows[0]?.submitted_at || new Date().toISOString(),
    };
  } finally {
    await client.end();
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
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    console.log('📋 Timesheet submission received');

    let timesheetData;
    const contentType = event.headers['content-type'] || '';

    if (contentType.includes('application/json')) {
      timesheetData = JSON.parse(event.body);
    } else {
      throw new Error('Unsupported content type - must be application/json');
    }

    console.log('📊 Timesheet data:', {
      timesheetId: timesheetData.timesheetId,
      clientId: timesheetData.clientId,
      weekEnding: timesheetData.weekEnding,
      workers: timesheetData.workers?.length,
      totalHours: timesheetData.totals?.totalHours,
    });

    if (!timesheetData.clientId || !timesheetData.weekEnding || !timesheetData.workers) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: 'Missing required fields: clientId, weekEnding, and workers are required',
        }),
      };
    }

    const result = await storeTimesheetInDatabase(timesheetData);

    if (result.duplicate) {
      return {
        statusCode: 409,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: false,
          duplicate: true,
          message: 'This timesheet has already been submitted.',
          timesheetId: result.timesheetId,
          submittedAt: result.submittedAt,
          status: result.status,
        }),
      };
    }

    console.log('✅ Timesheet saved to database:', result);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        message: 'Timesheet submitted successfully',
        timesheetId: result.timesheetId,
        entryCount: result.entryCount,
        taskId: result.taskId,
        status: result.status,
        submittedAt: result.submittedAt,
        savedToDatabase: true,
      }),
    };
  } catch (error) {
    console.error('💥 Timesheet submission error:', error);

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to process timesheet submission',
        details: error.message,
      }),
    };
  }
};
