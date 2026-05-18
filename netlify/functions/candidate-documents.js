/**
 * GET  /netlify/functions/candidate-documents   — document status
 * POST /netlify/functions/candidate-documents   — submit RTW share code
 *   Body: { shareCode: string } or { documentType: string, notes: string }
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
      // RTW status from contacts
      const contactResult = await db.query(
        `SELECT right_to_work, visa_type, visa_expiry, name FROM contacts WHERE id = $1`,
        [contactId]
      );
      const contact = contactResult.rows[0] || {};

      // Compliance documents
      let complianceDocs = [];
      try {
        const docsResult = await db.query(
          `SELECT id, document_type, status, expiry_date, uploaded_at, notes
             FROM compliance_documents
            WHERE contact_id = $1
            ORDER BY uploaded_at DESC`,
          [contactId]
        );
        complianceDocs = docsResult.rows;
      } catch { /* compliance_documents table may not exist */ }

      await db.end();
      return jsonResponse(200, {
        rtw: {
          status: contact.right_to_work || null,
          visaType: contact.visa_type || null,
          visaExpiry: contact.visa_expiry || null,
        },
        documents: complianceDocs,
      });
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

      const { shareCode, documentType, notes } = body;

      if (shareCode) {
        // Update RTW share code in contacts
        await db.query(
          `UPDATE contacts SET
             right_to_work = 'share_code',
             rtw_share_code = $1,
             rtw_submitted_at = NOW(),
             updated_at = NOW()
           WHERE id = $2`,
          [shareCode.trim().toUpperCase(), contactId]
        );

        // Log timeline event
        try {
          const histId = `HIST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await db.query(
            `INSERT INTO client_history (id, client_id, event_type, event_action, event_date, user_name, description, created_at)
             VALUES ($1, $2, 'rtw', 'share_code_submitted', NOW(), 'Candidate Portal', 'Candidate submitted RTW share code via portal', NOW())`,
            [histId, contactId]
          );
        } catch { /* non-critical */ }
      } else if (documentType) {
        // Generic document note submission (candidate is flagging they've uploaded something)
        try {
          await db.query(
            `INSERT INTO activity_log (contact_id, type, description, created_at)
             VALUES ($1, 'document_submitted', $2, NOW())`,
            [contactId, `Candidate submitted ${documentType} via portal${notes ? ': ' + notes : ''}`]
          );
        } catch { /* non-critical */ }
      } else {
        await db.end();
        return jsonResponse(400, { error: 'shareCode or documentType is required.' });
      }

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
            type: 'rtw_document_submitted',
            title: 'RTW Document Submitted',
            message: shareCode
              ? `${candidateName} submitted an RTW share code via portal — verify it now`
              : `${candidateName} submitted a ${documentType} document via portal`,
            icon: 'document-text-outline',
            color: '#F59E0B',
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
    console.error('❌ candidate-documents error:', err);
    try { await db.end(); } catch { /* ignore */ }
    return jsonResponse(500, { error: 'Internal server error.' });
  }
};
