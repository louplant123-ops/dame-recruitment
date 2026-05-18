/**
 * GET /netlify/functions/client-documents
 * Authorization: Bearer <token>
 *
 * Returns KIDs (Key Information Documents) for all workers placed with this client,
 * joined via kid_acknowledgements.assignment_id → client_placements.id.
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

    // KIDs via assignment_id → client_placements
    let kids = [];
    try {
      const result = await db.query(
        `SELECT
           ka.id,
           ka.worker_id,
           ka.worker_name,
           ka.worker_email,
           ka.assignment_id,
           ka.client_name,
           ka.job_title,
           ka.kid_sent_at,
           ka.kid_sent_via,
           ka.acknowledged,
           ka.acknowledged_at,
           ka.acknowledged_via,
           ka.kid_html,
           cp.start_date,
           cp.placement_type
         FROM kid_acknowledgements ka
         JOIN client_placements cp ON cp.id = ka.assignment_id
         WHERE cp.client_id = $1
         ORDER BY ka.kid_sent_at DESC`,
        [clientId]
      );
      kids = result.rows;
    } catch (err) {
      console.warn('⚠️ KID query failed (non-critical):', err.message);
    }

    // Also get compliance documents (RTW) for active workers
    let rtwDocs = [];
    try {
      const result = await db.query(
        `SELECT
           cd.id,
           cd.candidate_id,
           cd.document_type,
           cd.document_name,
           cd.status,
           cd.expiry_date,
           cd.issued_date,
           c.name AS worker_name
         FROM compliance_documents cd
         JOIN contacts c ON c.id = cd.candidate_id
         JOIN client_placements cp ON cp.candidate_id = cd.candidate_id
           AND cp.client_id = $1
           AND cp.status IN ('active', 'confirmed', 'placed', 'current')
         WHERE cd.document_type IN ('right_to_work', 'rtw', 'passport', 'visa', 'brp')
         ORDER BY cd.expiry_date ASC`,
        [clientId]
      );
      rtwDocs = result.rows;
    } catch (err) {
      console.warn('⚠️ RTW docs query failed (non-critical):', err.message);
    }

    await db.end();

    return jsonResponse(200, { kids, rtwDocs });
  } catch (err) {
    console.error('❌ client-documents error:', err);
    try { await db.end(); } catch { /* ignore */ }
    return jsonResponse(500, { error: 'Internal server error.' });
  }
};
