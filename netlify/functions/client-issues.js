/**
 * GET  /netlify/functions/client-issues  — list open + resolved issues for client
 * POST /netlify/functions/client-issues  — raise a new issue
 *   Body: { subject, description, category }
 */
const { getDbClient } = require('./db');
const {
  validateClientSession, unauthorised, preflight, jsonResponse,
} = require('./client-auth');

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
      const result = await db.query(
        `SELECT id, subject, description, category, status, created_at, resolved_at
           FROM client_issues
          WHERE client_id = $1
          ORDER BY created_at DESC
          LIMIT 30`,
        [clientId]
      );
      await db.end();
      return jsonResponse(200, { issues: result.rows });
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

      const { subject, description, category = 'general' } = body;
      if (!subject?.trim() || !description?.trim()) {
        await db.end();
        return jsonResponse(400, { error: 'subject and description are required.' });
      }

      const validCategories = ['worker', 'timesheet', 'invoice', 'general'];
      const safeCategory = validCategories.includes(category) ? category : 'general';

      const insertResult = await db.query(
        `INSERT INTO client_issues (client_id, subject, description, category)
         VALUES ($1, $2, $3, $4)
         RETURNING id, subject, description, category, status, created_at`,
        [clientId, subject.trim(), description.trim(), safeCategory]
      );

      const issue = insertResult.rows[0];

      // Fetch client name for the notification
      let clientName = 'A client';
      let assignedTo = null;
      try {
        const cr = await db.query(
          `SELECT name, company, assigned_to FROM contacts WHERE id = $1`,
          [clientId]
        );
        clientName = cr.rows[0]?.company || cr.rows[0]?.name || 'A client';
        assignedTo = cr.rows[0]?.assigned_to || null;
      } catch { /* non-critical */ }

      await db.end();

      // Notify consultant in Damedesk (non-critical)
      try {
        await fetch(`${RAILWAY_URL}/notifications/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(SERVER_API_KEY ? { 'x-api-key': SERVER_API_KEY } : {}),
          },
          body: JSON.stringify({
            type: 'client_issue',
            title: `Issue raised by ${clientName}`,
            message: subject.trim(),
            icon: 'alert-circle-outline',
            color: '#f59e0b',
            linkType: 'contact',
            linkId: clientId,
            assignedTo,
          }),
        });
      } catch { /* non-critical */ }

      return jsonResponse(201, { issue });
    }

    await db.end();
    return jsonResponse(405, { error: 'Method not allowed' });
  } catch (err) {
    console.error('❌ client-issues error:', err);
    try { await db.end(); } catch { /* ignore */ }
    return jsonResponse(500, { error: 'Internal server error.' });
  }
};
