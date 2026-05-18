/**
 * GET  /netlify/functions/client-timesheets          — list timesheets + entries
 * POST /netlify/functions/client-timesheets          — approve or reject a timesheet
 *   Body: { id: string, action: 'approve'|'reject', notes?: string }
 */
const { getDbClient } = require('./db');
const { validateClientSession, unauthorised, preflight, jsonResponse } = require('./client-auth');

const RAILWAY_URL = process.env.RAILWAY_BACKEND_URL || 'https://damedesk-production.up.railway.app';
const SERVER_API_KEY = process.env.SERVER_API_KEY || '';

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();

  const clientId = await validateClientSession(event.headers?.authorization);
  if (!clientId) return unauthorised();

  const db = getDbClient();
  try {
    await db.connect();

    // ── GET ─────────────────────────────────────────────────────────────────
    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {};
      const status = params.status || null;
      const limit  = Math.min(parseInt(params.limit || '20', 10), 50);

      const statusClause = status ? `AND t.status = $2` : '';
      const queryParams  = status ? [clientId, status] : [clientId];

      const tsResult = await db.query(
        `SELECT
           t.id, t.week_ending_date, t.status,
           t.submitted_at, t.approved_at, t.approved_by,
           t.total_hours, t.total_workers, t.comments
         FROM timesheets t
         WHERE t.client_id = $1
           ${statusClause}
         ORDER BY t.week_ending_date DESC
         LIMIT ${limit}`,
        queryParams
      );

      const timesheets = tsResult.rows;

      // Fetch entries for each timesheet
      const timesheetIds = timesheets.map(t => t.id);
      let entries = [];
      if (timesheetIds.length > 0) {
        const entriesResult = await db.query(
          `SELECT
             te.id, te.timesheet_id, te.worker_name, te.worker_id,
             te.date, te.start_time, te.end_time, te.hours_worked,
             te.overtime_hours, te.charge_rate, te.status, te.notes
           FROM timesheet_entries te
           WHERE te.timesheet_id = ANY($1::text[])
           ORDER BY te.date ASC`,
          [timesheetIds]
        );
        entries = entriesResult.rows;
      }

      await db.end();

      // Group entries by timesheet id
      const entriesByTs = {};
      for (const e of entries) {
        if (!entriesByTs[e.timesheet_id]) entriesByTs[e.timesheet_id] = [];
        entriesByTs[e.timesheet_id].push(e);
      }

      const result = timesheets.map(ts => ({
        ...ts,
        entries: entriesByTs[ts.id] || [],
      }));

      return jsonResponse(200, { timesheets: result });
    }

    // ── POST ─────────────────────────────────────────────────────────────────
    if (event.httpMethod === 'POST') {
      let body;
      try {
        body = JSON.parse(event.body || '{}');
      } catch {
        await db.end();
        return jsonResponse(400, { error: 'Invalid JSON' });
      }

      const { id, action, notes } = body;
      if (!id || !['approve', 'reject'].includes(action)) {
        await db.end();
        return jsonResponse(400, { error: 'id and action ("approve"|"reject") are required.' });
      }

      // Verify this timesheet belongs to the client
      const check = await db.query(
        `SELECT id, status FROM timesheets WHERE id = $1 AND client_id = $2`,
        [id, clientId]
      );
      if (check.rows.length === 0) {
        await db.end();
        return jsonResponse(404, { error: 'Timesheet not found.' });
      }

      const newStatus = action === 'approve' ? 'approved' : 'rejected';

      await db.query(
        `UPDATE timesheets
            SET status = $1, approved_at = NOW(), approved_by = 'client_portal',
                comments = COALESCE($2, comments), updated_at = NOW()
          WHERE id = $3 AND client_id = $4`,
        [newStatus, notes || null, id, clientId]
      );

      await db.end();

      // Notify consultant via Railway (non-critical)
      try {
        await fetch(`${RAILWAY_URL}/notifications/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(SERVER_API_KEY ? { 'x-api-key': SERVER_API_KEY } : {}),
          },
          body: JSON.stringify({
            type: 'timesheet_' + (action === 'approve' ? 'approved' : 'rejected'),
            title: `Timesheet ${action === 'approve' ? 'Approved' : 'Rejected'} by Client`,
            message: `A client has ${action}d a timesheet via the portal.`,
            icon: action === 'approve' ? 'checkmark-circle-outline' : 'close-circle-outline',
            color: action === 'approve' ? '#22c55e' : '#ef4444',
          }),
        });
      } catch { /* non-critical */ }

      return jsonResponse(200, { success: true, status: newStatus });
    }

    await db.end();
    return jsonResponse(405, { error: 'Method not allowed' });
  } catch (err) {
    console.error('❌ client-timesheets error:', err);
    try { await db.end(); } catch { /* ignore */ }
    return jsonResponse(500, { error: 'Internal server error.' });
  }
};
