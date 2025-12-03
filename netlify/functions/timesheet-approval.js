const { Client } = require('pg');

// Get timesheet data from database
async function getTimesheetFromDatabase(timesheetId) {
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

    // Get timesheet
    const timesheetQuery = `
      SELECT t.*, c.name as client_name, c.email as client_email
      FROM timesheets t
      LEFT JOIN contacts c ON t.client_id = c.id
      WHERE t.id = $1
    `;
    const timesheetResult = await client.query(timesheetQuery, [timesheetId]);
    
    if (timesheetResult.rows.length === 0) {
      await client.end();
      return null;
    }

    const timesheet = timesheetResult.rows[0];

    // Get entries
    const entriesQuery = `
      SELECT * FROM timesheet_entries
      WHERE timesheet_id = $1
      ORDER BY date ASC
    `;
    const entriesResult = await client.query(entriesQuery, [timesheetId]);

    await client.end();

    return {
      ...timesheet,
      entries: entriesResult.rows
    };
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

// Approve timesheet
async function approveTimesheet(timesheetId, approvalData) {
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

    const updateQuery = `
      UPDATE timesheets
      SET status = 'approved',
          approved_by = $1,
          approved_at = NOW(),
          approval_signature = $2,
          approval_notes = $3,
          updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `;

    const result = await client.query(updateQuery, [
      approvalData.approverName,
      approvalData.signature,
      approvalData.notes || '',
      timesheetId
    ]);

    const approvedTimesheet = result.rows[0];

    // Create timeline event for timesheet approval
    try {
      const historyId = `HIST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const insertHistoryQuery = `
        INSERT INTO client_history (
          id, client_id, event_type, event_action, event_date,
          user_name, description, metadata, created_at
        ) VALUES ($1, $2, 'timesheet', 'approved', NOW(), $3, $4, $5, NOW())
      `;

      const historyValues = [
        historyId,
        approvedTimesheet.client_id,
        approvalData.approverName,
        `Timesheet approved for week ending ${approvedTimesheet.week_ending_date}`,
        JSON.stringify({
          timesheet_id: timesheetId,
          week_ending: approvedTimesheet.week_ending_date,
          total_hours: approvedTimesheet.total_hours,
          approved_by: approvalData.approverName,
          approved_at: new Date().toISOString(),
          approval_notes: approvalData.notes || ''
        })
      ];

      await client.query(insertHistoryQuery, historyValues);
      console.log('✅ Timeline event created for timesheet approval');
    } catch (historyError) {
      console.error('⚠️ Failed to create timeline event:', historyError);
      // Continue anyway - timesheet approval is complete
    }

    await client.end();
    return approvedTimesheet;
  } catch (error) {
    console.error('Approval error:', error);
    throw error;
  }
}

exports.handler = async (event, context) => {
  const token = event.queryStringParameters?.token || '';
  
  // Decode token to get timesheet ID
  let timesheetId = '';
  try {
    timesheetId = Buffer.from(token, 'base64').toString('utf-8');
  } catch (e) {
    console.error('Failed to decode token:', e);
    timesheetId = '';
  }

  // Handle approval submission (POST)
  if (event.httpMethod === 'POST') {
    try {
      const approvalData = JSON.parse(event.body);
      await approveTimesheet(timesheetId, approvalData);
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ success: true, message: 'Timesheet approved successfully' })
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Failed to approve timesheet' })
      };
    }
  }

  // Get timesheet data for display
  let timesheet = null;
  if (timesheetId) {
    try {
      timesheet = await getTimesheetFromDatabase(timesheetId);
    } catch (error) {
      console.error('Error fetching timesheet:', error);
    }
  }

  // HTML page
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Timesheet Approval - Dame Recruitment</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-gray-50">
    <div id="app">
        ${!timesheet || !timesheetId ? `
        <div class="min-h-screen bg-gray-50 flex items-center justify-center">
            <div class="bg-white p-8 rounded-lg shadow-lg max-w-md">
                <h1 class="text-2xl font-bold text-red-600 mb-4">Invalid Timesheet Link</h1>
                <p class="text-gray-600 mb-6">This timesheet link is invalid or has expired.</p>
                <a href="https://damerecruitment.co.uk" class="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700">Return Home</a>
            </div>
        </div>
        ` : timesheet.status === 'approved' ? `
        <div class="min-h-screen bg-gray-50 flex items-center justify-center">
            <div class="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
                <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h1 class="text-2xl font-bold text-gray-900 mb-4">Already Approved</h1>
                <p class="text-gray-600 mb-2">This timesheet was approved on ${new Date(timesheet.approved_at).toLocaleDateString()}</p>
                <p class="text-gray-600 mb-6">by ${timesheet.approved_by}</p>
                <a href="https://damerecruitment.co.uk" class="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700">Return Home</a>
            </div>
        </div>
        ` : `
        <div class="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12">
            <div class="max-w-4xl mx-auto px-4">
                <!-- Header -->
                <div class="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
                    <div class="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6">
                        <h1 class="text-3xl font-bold text-white">Timesheet Approval</h1>
                        <p class="text-purple-100 mt-2">Week Ending: ${timesheet.week_ending_date}</p>
                    </div>
                    
                    <div class="p-8">
                        <div class="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <p class="text-sm text-gray-600">Client</p>
                                <p class="text-lg font-semibold text-gray-900">${timesheet.client_name || 'Unknown'}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-600">Submitted</p>
                                <p class="text-lg font-semibold text-gray-900">${new Date(timesheet.submitted_at).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <!-- Timesheet Summary -->
                        <div class="bg-gray-50 rounded-lg p-6 mb-6">
                            <h2 class="text-xl font-semibold text-gray-900 mb-4">Timesheet Summary</h2>
                            
                            <table class="w-full">
                                <thead>
                                    <tr class="border-b border-gray-200">
                                        <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Worker</th>
                                        <th class="text-center py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                                        <th class="text-center py-3 px-4 text-sm font-semibold text-gray-700">Hours</th>
                                        <th class="text-right py-3 px-4 text-sm font-semibold text-gray-700">Rate</th>
                                        <th class="text-right py-3 px-4 text-sm font-semibold text-gray-700">Cost</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${timesheet.entries.map(entry => `
                                    <tr class="border-b border-gray-100">
                                        <td class="py-3 px-4 text-sm text-gray-900">${entry.worker_name}</td>
                                        <td class="py-3 px-4 text-sm text-gray-600 text-center">${new Date(entry.date).toLocaleDateString()}</td>
                                        <td class="py-3 px-4 text-sm text-gray-900 text-center font-medium">${entry.hours_worked}h</td>
                                        <td class="py-3 px-4 text-sm text-gray-600 text-right">£${parseFloat(entry.hourly_rate).toFixed(2)}/h</td>
                                        <td class="py-3 px-4 text-sm text-gray-900 text-right font-medium">£${(entry.hours_worked * entry.hourly_rate).toFixed(2)}</td>
                                    </tr>
                                    `).join('')}
                                </tbody>
                                <tfoot>
                                    <tr class="border-t-2 border-gray-300">
                                        <td colspan="2" class="py-4 px-4 text-right font-semibold text-gray-700">Total:</td>
                                        <td class="py-4 px-4 text-center font-bold text-gray-900">${timesheet.total_hours}h</td>
                                        <td colspan="2" class="py-4 px-4 text-right font-bold text-green-600 text-lg">
                                            £${timesheet.entries.reduce((sum, e) => sum + (e.hours_worked * e.hourly_rate), 0).toFixed(2)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <!-- Approval Form -->
                        <form id="approvalForm" class="space-y-6">
                            <input type="hidden" id="timesheetId" value="${timesheetId}">
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Your Name *
                                </label>
                                <input type="text" id="approverName" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" required>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Notes (Optional)
                                </label>
                                <textarea id="notes" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"></textarea>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Digital Signature (Type your full name) *
                                </label>
                                <input type="text" id="signature" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Type your full name" required>
                            </div>

                            <div class="flex items-center">
                                <input type="checkbox" id="confirmAccuracy" class="mr-3 h-4 w-4 text-purple-600 rounded" required>
                                <label for="confirmAccuracy" class="text-sm text-gray-700">
                                    I confirm that the hours and information on this timesheet are accurate
                                </label>
                            </div>

                            <button type="submit" id="submitBtn" class="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all">
                                Approve Timesheet
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Success message (hidden initially) -->
        <div id="successMessage" class="hidden min-h-screen bg-gray-50 flex items-center justify-center">
            <div class="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
                <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h1 class="text-2xl font-bold text-gray-900 mb-4">Timesheet Approved!</h1>
                <p class="text-gray-600 mb-6">Thank you for approving this timesheet. The team has been notified.</p>
                <a href="https://damerecruitment.co.uk" class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">Return Home</a>
            </div>
        </div>
        `}
    </div>

    <script>
        const form = document.getElementById('approvalForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const submitBtn = document.getElementById('submitBtn');
                submitBtn.disabled = true;
                submitBtn.textContent = 'Approving...';
                
                const approvalData = {
                    approverName: document.getElementById('approverName').value,
                    signature: document.getElementById('signature').value,
                    notes: document.getElementById('notes').value
                };
                
                try {
                    const response = await fetch(window.location.href, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(approvalData)
                    });
                    
                    if (response.ok) {
                        document.getElementById('app').innerHTML = document.getElementById('successMessage').innerHTML;
                    } else {
                        alert('Failed to approve timesheet. Please try again.');
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Approve Timesheet';
                    }
                } catch (error) {
                    alert('Error: ' + error.message);
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Approve Timesheet';
                }
            });
        }
    </script>
</body>
</html>
  `;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache'
    },
    body: html
  };
};
