const { Client } = require('pg');

// Get timesheet template data
async function getTimesheetTemplate(timesheetId) {
  try {
    const client = new Client({
      host: process.env.DB_HOST || 'damedesk-crm-production-do-user-27348714-0.j.db.ondigitalocean.com',
      port: process.env.DB_PORT || 25060,
      database: process.env.DB_NAME || 'defaultdb',
      user: process.env.DB_USER || 'doadmin',
      password: process.env.DB_PASSWORD || 'AVNS_wm_vFxOY5--ftSp64EL',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000
    });

    await client.connect();
    console.log('Looking up timesheet:', timesheetId);

    // Get timesheet details
    const timesheetQuery = `
      SELECT t.*, c.name as client_name, c.company as client_company
      FROM timesheets t
      LEFT JOIN contacts c ON t.client_id = c.id
      WHERE t.id = $1
    `;
    const timesheetResult = await client.query(timesheetQuery, [timesheetId]);
    
    if (timesheetResult.rows.length === 0) {
      await client.end();
      console.log('Timesheet not found');
      return null;
    }

    const timesheet = timesheetResult.rows[0];
    console.log('Timesheet found:', timesheet.id);

    // Get workers from timesheet entries
    const workersQuery = `
      SELECT DISTINCT worker_id as id, worker_name as name
      FROM timesheet_entries
      WHERE timesheet_id = $1
      ORDER BY worker_name
    `;
    
    const workersResult = await client.query(workersQuery, [timesheetId]);
    console.log('Workers found:', workersResult.rows.length);

    await client.end();

    return {
      ...timesheet,
      workers: workersResult.rows
    };
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

exports.handler = async (event) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const token = event.queryStringParameters?.token;
    
    if (!token) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Token is required' })
      };
    }

    // Decode token to get timesheet ID
    const timesheetId = Buffer.from(token, 'base64').toString('utf-8');
    console.log('Decoded timesheet ID:', timesheetId);

    const timesheetData = await getTimesheetTemplate(timesheetId);

    if (!timesheetData) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Timesheet not found' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(timesheetData)
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
};
