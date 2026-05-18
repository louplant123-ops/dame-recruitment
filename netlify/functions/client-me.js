/**
 * GET /netlify/functions/client-me
 * Authorization: Bearer <token>
 *
 * Returns client profile, active placement stats, pending timesheets,
 * and outstanding invoice total for the dashboard hero card.
 */
const { getDbClient } = require('./db');
const { validateClientSession, unauthorised, preflight, jsonResponse } = require('./client-auth');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();
  if (event.httpMethod !== 'GET') return jsonResponse(405, { error: 'Method not allowed' });

  const clientId = await validateClientSession(event.headers?.authorization);
  if (!clientId) return unauthorised();

  const db = getDbClient();
  try {
    await db.connect();

    // Client profile + consultant
    const clientResult = await db.query(
      `SELECT
         c.id, c.name, c.email, c.phone, c.company,
         c.assigned_to,
         con.name  AS consultant_name,
         con.email AS consultant_email,
         con.phone AS consultant_phone
       FROM contacts c
       LEFT JOIN contacts con ON con.id = c.assigned_to
       WHERE c.id = $1`,
      [clientId]
    );

    if (clientResult.rows.length === 0) {
      await db.end();
      return jsonResponse(404, { error: 'Client not found.' });
    }

    const client = clientResult.rows[0];

    // Active placements count
    let activePlacements = 0;
    try {
      const res = await db.query(
        `SELECT COUNT(*) FROM client_placements
          WHERE client_id = $1 AND status IN ('active', 'confirmed', 'placed', 'current')`,
        [clientId]
      );
      activePlacements = parseInt(res.rows[0]?.count || '0', 10);
    } catch { /* non-critical */ }

    // Workers on shift this week
    let workersThisWeek = 0;
    try {
      const res = await db.query(
        `SELECT COUNT(DISTINCT candidate_id) FROM shifts
          WHERE client_id = $1
            AND shift_date >= date_trunc('week', CURRENT_DATE)
            AND shift_date < date_trunc('week', CURRENT_DATE) + INTERVAL '7 days'
            AND status NOT IN ('cancelled', 'no_show')`,
        [clientId]
      );
      workersThisWeek = parseInt(res.rows[0]?.count || '0', 10);
    } catch { /* non-critical */ }

    // Timesheets pending approval
    let pendingTimesheets = 0;
    try {
      const res = await db.query(
        `SELECT COUNT(*) FROM timesheets
          WHERE client_id = $1 AND status = 'submitted'`,
        [clientId]
      );
      pendingTimesheets = parseInt(res.rows[0]?.count || '0', 10);
    } catch { /* non-critical */ }

    // Outstanding invoice total
    let outstandingTotal = 0;
    try {
      const res = await db.query(
        `SELECT COALESCE(SUM(total_amount), 0) AS total FROM client_invoices
          WHERE client_id = $1 AND status IN ('sent', 'overdue')`,
        [clientId]
      );
      outstandingTotal = parseFloat(res.rows[0]?.total || '0');
    } catch { /* non-critical */ }

    // Open issues count
    let openIssues = 0;
    try {
      const res = await db.query(
        `SELECT COUNT(*) FROM client_issues WHERE client_id = $1 AND status != 'resolved'`,
        [clientId]
      );
      openIssues = parseInt(res.rows[0]?.count || '0', 10);
    } catch { /* non-critical */ }

    await db.end();

    return jsonResponse(200, {
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        company: client.company,
      },
      consultant: client.consultant_name ? {
        name: client.consultant_name,
        email: client.consultant_email,
        phone: client.consultant_phone,
      } : null,
      stats: {
        activePlacements,
        workersThisWeek,
        pendingTimesheets,
        outstandingTotal,
        openIssues,
      },
    });
  } catch (err) {
    console.error('❌ client-me error:', err);
    try { await db.end(); } catch { /* ignore */ }
    return jsonResponse(500, { error: 'Internal server error.' });
  }
};
