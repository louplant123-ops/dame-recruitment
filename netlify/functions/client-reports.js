/**
 * GET /netlify/functions/client-reports
 * Authorization: Bearer <token>
 * Query: ?from=YYYY-MM-DD&to=YYYY-MM-DD
 *        defaults to last 30 days
 *
 * Returns MI (management information) metrics:
 *   - activeWorkers: distinct workers with shifts in period
 *   - totalShifts: shifts scheduled
 *   - confirmedShifts: shifts with status = 'confirmed' | 'worked'
 *   - noShowCount: shifts with status = 'no_show'
 *   - fillRate: confirmedShifts / totalShifts (%)
 *   - noShowRate: noShowCount / totalShifts (%)
 *   - totalHours: sum of hours_worked
 *   - activePlacements: count at end of period
 */
const { getDbClient } = require('./db');
const { validateClientSession, unauthorised, preflight, jsonResponse } = require('./client-auth');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();
  if (event.httpMethod !== 'GET') return jsonResponse(405, { error: 'Method not allowed' });

  const clientId = await validateClientSession(event.headers?.authorization);
  if (!clientId) return unauthorised();

  const params = event.queryStringParameters || {};
  const to   = params.to   || new Date().toISOString().split('T')[0];
  const from = params.from || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

  const db = getDbClient();
  try {
    await db.connect();

    // Shift metrics
    let shiftMetrics = {
      totalShifts: 0,
      confirmedShifts: 0,
      noShowCount: 0,
      totalHours: 0,
      activeWorkers: 0,
    };
    try {
      const result = await db.query(
        `SELECT
           COUNT(*)                                                          AS total_shifts,
           COUNT(*) FILTER (WHERE status IN ('confirmed', 'worked'))        AS confirmed_shifts,
           COUNT(*) FILTER (WHERE status = 'no_show')                       AS no_show_count,
           COALESCE(SUM(hours_worked), 0)                                   AS total_hours,
           COUNT(DISTINCT candidate_id)                                     AS active_workers
         FROM shifts
         WHERE client_id = $1
           AND shift_date BETWEEN $2 AND $3`,
        [clientId, from, to]
      );
      const row = result.rows[0];
      shiftMetrics = {
        totalShifts:    parseInt(row.total_shifts, 10),
        confirmedShifts: parseInt(row.confirmed_shifts, 10),
        noShowCount:    parseInt(row.no_show_count, 10),
        totalHours:     parseFloat(row.total_hours),
        activeWorkers:  parseInt(row.active_workers, 10),
      };
    } catch (err) {
      console.warn('⚠️ Shift metrics query failed:', err.message);
    }

    // Active placements count
    let activePlacements = 0;
    try {
      const res = await db.query(
        `SELECT COUNT(*) FROM client_placements
          WHERE client_id = $1
            AND status IN ('active', 'confirmed', 'placed', 'current')
            AND start_date <= $2`,
        [clientId, to]
      );
      activePlacements = parseInt(res.rows[0]?.count || '0', 10);
    } catch { /* non-critical */ }

    // Timesheet approval rate (approved vs submitted)
    let timesheetMetrics = { submitted: 0, approved: 0 };
    try {
      const res = await db.query(
        `SELECT
           COUNT(*) FILTER (WHERE status IN ('submitted', 'approved')) AS submitted,
           COUNT(*) FILTER (WHERE status = 'approved')                 AS approved
         FROM timesheets
         WHERE client_id = $1
           AND week_ending_date BETWEEN $2 AND $3`,
        [clientId, from, to]
      );
      timesheetMetrics = {
        submitted: parseInt(res.rows[0]?.submitted || '0', 10),
        approved:  parseInt(res.rows[0]?.approved  || '0', 10),
      };
    } catch { /* non-critical */ }

    const { totalShifts, confirmedShifts, noShowCount } = shiftMetrics;
    const fillRate   = totalShifts > 0 ? Math.round((confirmedShifts / totalShifts) * 100) : null;
    const noShowRate = totalShifts > 0 ? Math.round((noShowCount / totalShifts) * 100)    : null;

    await db.end();

    return jsonResponse(200, {
      from,
      to,
      metrics: {
        ...shiftMetrics,
        activePlacements,
        fillRate,
        noShowRate,
        timesheetApprovalRate: timesheetMetrics.submitted > 0
          ? Math.round((timesheetMetrics.approved / timesheetMetrics.submitted) * 100)
          : null,
      },
    });
  } catch (err) {
    console.error('❌ client-reports error:', err);
    try { await db.end(); } catch { /* ignore */ }
    return jsonResponse(500, { error: 'Internal server error.' });
  }
};
