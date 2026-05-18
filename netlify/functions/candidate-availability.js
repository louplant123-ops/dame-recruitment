/**
 * GET  /netlify/functions/candidate-availability   — current + next week
 * POST /netlify/functions/candidate-availability   — save availability
 *   Body: { weekStart: 'YYYY-MM-DD', monday-sunday: boolean, notes?: string }
 */
const { getDbClient } = require('./db');
const { validateSession, unauthorised, preflight, jsonResponse } = require('./candidate-auth');

const RAILWAY_URL = process.env.RAILWAY_BACKEND_URL || 'https://damedesk-production.up.railway.app';
const SERVER_API_KEY = process.env.SERVER_API_KEY || '';

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();

  const contactId = await validateSession(event.headers?.authorization);
  if (!contactId) return unauthorised();

  const db = getDbClient();
  try {
    await db.connect();

    // ── GET ────────────────────────────────────────────────────────────────
    if (event.httpMethod === 'GET') {
      const result = await db.query(
        `SELECT week_start, monday, tuesday, wednesday, thursday, friday, saturday, sunday, notes
           FROM candidate_availability
          WHERE contact_id = $1
            AND week_start >= CURRENT_DATE - INTERVAL '7 days'
          ORDER BY week_start ASC
          LIMIT 4`,
        [contactId]
      );
      await db.end();
      return jsonResponse(200, { availability: result.rows });
    }

    // ── POST ───────────────────────────────────────────────────────────────
    if (event.httpMethod === 'POST') {
      let body;
      try {
        body = JSON.parse(event.body || '{}');
      } catch {
        await db.end();
        return jsonResponse(400, { error: 'Invalid JSON' });
      }

      const { weekStart, monday, tuesday, wednesday, thursday, friday, saturday, sunday, notes } = body;

      if (!weekStart || !/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) {
        await db.end();
        return jsonResponse(400, { error: 'weekStart (YYYY-MM-DD) is required.' });
      }

      await db.query(
        `INSERT INTO candidate_availability
           (contact_id, week_start, monday, tuesday, wednesday, thursday, friday, saturday, sunday, notes, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
         ON CONFLICT (contact_id, week_start)
         DO UPDATE SET
           monday = EXCLUDED.monday, tuesday = EXCLUDED.tuesday,
           wednesday = EXCLUDED.wednesday, thursday = EXCLUDED.thursday,
           friday = EXCLUDED.friday, saturday = EXCLUDED.saturday,
           sunday = EXCLUDED.sunday, notes = EXCLUDED.notes,
           updated_at = NOW()`,
        [
          contactId, weekStart,
          monday ?? true, tuesday ?? true, wednesday ?? true,
          thursday ?? true, friday ?? true,
          saturday ?? false, sunday ?? false,
          notes || null,
        ]
      );

      // Log activity
      try {
        await db.query(
          `INSERT INTO activity_log (contact_id, type, description, created_at)
           VALUES ($1, 'availability_update', $2, NOW())`,
          [contactId, `Candidate updated availability for week of ${weekStart} via portal`]
        );
      } catch { /* non-critical */ }

      // Notify consultant
      try {
        const nameRes = await db.query(`SELECT name, assigned_to FROM contacts WHERE id = $1`, [contactId]);
        const candidateName = nameRes.rows[0]?.name || 'Candidate';
        const assignedTo = nameRes.rows[0]?.assigned_to;
        await fetch(`${RAILWAY_URL}/notifications/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(SERVER_API_KEY ? { 'x-api-key': SERVER_API_KEY } : {}),
          },
          body: JSON.stringify({
            type: 'availability_updated',
            title: 'Availability Updated',
            message: `${candidateName} updated their availability for w/c ${weekStart}`,
            icon: 'calendar-outline',
            color: '#3B82F6',
            linkType: 'contact',
            linkId: contactId,
            assignedTo,
          }),
        });
      } catch { /* non-critical */ }

      await db.end();
      return jsonResponse(200, { success: true });
    }

    await db.end();
    return jsonResponse(405, { error: 'Method not allowed' });
  } catch (err) {
    console.error('❌ candidate-availability error:', err);
    try { await db.end(); } catch { /* ignore */ }
    return jsonResponse(500, { error: 'Internal server error.' });
  }
};
