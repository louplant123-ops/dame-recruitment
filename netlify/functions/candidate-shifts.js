/**
 * GET  /netlify/functions/candidate-shifts  — upcoming shifts (next 28 days)
 * POST /netlify/functions/candidate-shifts  — confirm or decline a shift
 *   Body: { shiftId: string, action: 'confirm' | 'decline' }
 */
const { getDbClient } = require('./db');
const { validateSession, unauthorised, preflight, jsonResponse } = require('./candidate-auth');

const RAILWAY_URL = process.env.RAILWAY_BACKEND_URL || 'https://damedesk-production.up.railway.app';
const SERVER_API_KEY = process.env.SERVER_API_KEY || '';

async function notifyConsultant(payload) {
  try {
    await fetch(`${RAILWAY_URL}/notifications/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(SERVER_API_KEY ? { 'x-api-key': SERVER_API_KEY } : {}),
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn('⚠️ Failed to send consultant notification:', err.message);
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();

  const contactId = await validateSession(event.headers?.authorization);
  if (!contactId) return unauthorised();

  const db = getDbClient();
  try {
    await db.connect();

    // ── GET: fetch upcoming shifts ─────────────────────────────────────────
    if (event.httpMethod === 'GET') {
      const result = await db.query(
        `SELECT
           s.id,
           s.shift_date,
           s.start_time,
           s.end_time,
           s.status,
           s.notes,
           COALESCE(j.title, 'Shift') AS job_title,
           COALESCE(cl.name, 'Site TBC') AS site_name,
           cl.id AS client_id
         FROM shifts s
         LEFT JOIN contacts cl ON cl.id = s.client_id
         LEFT JOIN jobs j ON j.id = s.job_id
         WHERE s.candidate_id = $1
           AND s.shift_date >= CURRENT_DATE
           AND s.shift_date <= CURRENT_DATE + INTERVAL '28 days'
         ORDER BY s.shift_date ASC, s.start_time ASC
         LIMIT 50`,
        [contactId]
      );

      await db.end();
      return jsonResponse(200, { shifts: result.rows });
    }

    // ── POST: confirm or decline ───────────────────────────────────────────
    if (event.httpMethod === 'POST') {
      let shiftId, action;
      try {
        ({ shiftId, action } = JSON.parse(event.body || '{}'));
      } catch {
        await db.end();
        return jsonResponse(400, { error: 'Invalid JSON' });
      }

      if (!shiftId || !['confirm', 'decline'].includes(action)) {
        await db.end();
        return jsonResponse(400, { error: 'shiftId and action (confirm|decline) are required.' });
      }

      // Verify this shift belongs to this candidate
      const shiftResult = await db.query(
        `SELECT s.id, s.shift_date, s.status,
                COALESCE(j.title, 'shift') AS job_title,
                COALESCE(cl.name, 'site') AS site_name
           FROM shifts s
           LEFT JOIN jobs j ON j.id = s.job_id
           LEFT JOIN contacts cl ON cl.id = s.client_id
           WHERE s.id = $1 AND s.candidate_id = $2`,
        [shiftId, contactId]
      );

      if (shiftResult.rows.length === 0) {
        await db.end();
        return jsonResponse(404, { error: 'Shift not found.' });
      }

      const shift = shiftResult.rows[0];
      const newStatus = action === 'confirm' ? 'confirmed' : 'declined';

      await db.query(
        `UPDATE shifts SET status = $1, updated_at = NOW() WHERE id = $2`,
        [newStatus, shiftId]
      );

      // Log activity
      try {
        await db.query(
          `INSERT INTO activity_log (contact_id, type, description, created_at)
           VALUES ($1, 'shift_response', $2, NOW())`,
          [contactId, `Candidate ${action}ed shift on ${shift.shift_date} via portal`]
        );
      } catch { /* non-critical */ }

      // Get candidate name for notification
      const nameResult = await db.query(`SELECT name, assigned_to FROM contacts WHERE id = $1`, [contactId]);
      const candidateName = nameResult.rows[0]?.name || 'Candidate';
      const assignedTo = nameResult.rows[0]?.assigned_to;

      await db.end();

      // Notify consultant
      const icon = action === 'confirm' ? 'checkmark-circle-outline' : 'close-circle-outline';
      const color = action === 'confirm' ? '#10B981' : '#EF4444';
      await notifyConsultant({
        type: `shift_${action}ed`,
        title: `Shift ${action === 'confirm' ? 'Confirmed' : 'Declined'} via Portal`,
        message: `${candidateName} has ${action}ed their ${shift.job_title} shift on ${shift.shift_date}`,
        icon,
        color,
        linkType: 'contact',
        linkId: contactId,
        assignedTo,
      });

      return jsonResponse(200, { success: true, status: newStatus });
    }

    await db.end();
    return jsonResponse(405, { error: 'Method not allowed' });
  } catch (err) {
    console.error('❌ candidate-shifts error:', err);
    try { await db.end(); } catch { /* ignore */ }
    return jsonResponse(500, { error: 'Internal server error.' });
  }
};
