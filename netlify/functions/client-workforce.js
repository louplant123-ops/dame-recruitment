/**
 * GET /netlify/functions/client-workforce
 * Authorization: Bearer <token>
 * Query: ?from=YYYY-MM-DD&to=YYYY-MM-DD (optional, defaults to current week + next week)
 *
 * Returns active placements and their shifts for the client.
 */
const { getDbClient } = require('./db');
const { validateClientSession, unauthorised, preflight, jsonResponse } = require('./client-auth');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();
  if (event.httpMethod !== 'GET') return jsonResponse(405, { error: 'Method not allowed' });

  const clientId = await validateClientSession(event.headers?.authorization);
  if (!clientId) return unauthorised();

  const params = event.queryStringParameters || {};
  const from = params.from || new Date(Date.now()).toISOString().split('T')[0];
  const to   = params.to   || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

  const db = getDbClient();
  try {
    await db.connect();

    // Active placements for this client
    const placementsResult = await db.query(
      `SELECT
         cp.id, cp.candidate_id, cp.candidate_name,
         cp.job_title, cp.start_date, cp.end_date,
         cp.placement_type, cp.hourly_rate, cp.charge_rate,
         cand.name AS worker_name, cand.phone AS worker_phone
       FROM client_placements cp
       LEFT JOIN contacts cand ON cand.id = cp.candidate_id
       WHERE cp.client_id = $1
         AND cp.status IN ('active', 'confirmed', 'placed', 'current')
       ORDER BY cp.start_date DESC`,
      [clientId]
    );

    const placements = placementsResult.rows;
    const candidateIds = placements.map(p => p.candidate_id).filter(Boolean);

    // Shifts for those workers in the requested window
    let shifts = [];
    if (candidateIds.length > 0) {
      const placeholders = candidateIds.map((_, i) => `$${i + 3}`).join(', ');
      const shiftsResult = await db.query(
        `SELECT
           s.id, s.candidate_id, s.placement_id,
           s.shift_date, s.start_time, s.end_time,
           s.hours_worked, s.status, s.notes,
           s.charge_rate,
           cand.name AS worker_name
         FROM shifts s
         LEFT JOIN contacts cand ON cand.id = s.candidate_id
         WHERE s.client_id = $1
           AND s.shift_date BETWEEN $2 AND $3
           AND s.candidate_id = ANY($4::text[])
         ORDER BY s.shift_date ASC, s.start_time ASC`,
        [clientId, from, to, candidateIds]
      );
      shifts = shiftsResult.rows;
    }

    await db.end();

    // Nest shifts under their placements
    const shiftsByCandidate = {};
    for (const s of shifts) {
      if (!shiftsByCandidate[s.candidate_id]) shiftsByCandidate[s.candidate_id] = [];
      shiftsByCandidate[s.candidate_id].push(s);
    }

    const workforce = placements.map(p => ({
      ...p,
      shifts: shiftsByCandidate[p.candidate_id] || [],
    }));

    return jsonResponse(200, { workforce, from, to });
  } catch (err) {
    console.error('❌ client-workforce error:', err);
    try { await db.end(); } catch { /* ignore */ }
    return jsonResponse(500, { error: 'Internal server error.' });
  }
};
