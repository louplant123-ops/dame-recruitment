/**
 * GET  /netlify/functions/candidate-referral   — list this candidate's referrals
 * POST /netlify/functions/candidate-referral   — submit a new referral
 *   Body: { name: string, phone: string, email?: string }
 */
const { getDbClient } = require('./db');
const { validateSession, unauthorised, preflight, jsonResponse } = require('./candidate-auth');

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.damerecruitment.co.uk';
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
        `SELECT referee_name, referee_phone, status, created_at, placed_at
           FROM candidate_referrals
          WHERE referrer_contact_id = $1
          ORDER BY created_at DESC
          LIMIT 20`,
        [contactId]
      );
      await db.end();
      return jsonResponse(200, { referrals: result.rows });
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

      const { name, phone, email } = body;

      if (!name || !phone) {
        await db.end();
        return jsonResponse(400, { error: 'Name and phone number are required.' });
      }

      // Build a pre-filled registration URL with referrer attribution
      const params = new URLSearchParams({
        ref: contactId,
        refphone: phone,
        refname: name,
      });
      const registrationUrl = `${SITE_URL}/register?${params.toString()}`;

      // Get referrer info for notification
      const referrerResult = await db.query(
        `SELECT name, assigned_to FROM contacts WHERE id = $1`,
        [contactId]
      );
      const referrer = referrerResult.rows[0];
      const referrerName = referrer?.name || 'Candidate';
      const assignedTo = referrer?.assigned_to;

      // Save referral
      const insertResult = await db.query(
        `INSERT INTO candidate_referrals
           (referrer_contact_id, referee_name, referee_phone, referee_email, registration_url)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [contactId, name.trim(), phone.trim(), email?.trim() || null, registrationUrl]
      );

      // Log activity
      try {
        await db.query(
          `INSERT INTO activity_log (contact_id, type, description, created_at)
           VALUES ($1, 'referral_made', $2, NOW())`,
          [contactId, `Referred ${name} (${phone}) via portal`]
        );
      } catch { /* non-critical */ }

      await db.end();

      // Notify consultant
      try {
        await fetch(`${RAILWAY_URL}/notifications/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(SERVER_API_KEY ? { 'x-api-key': SERVER_API_KEY } : {}),
          },
          body: JSON.stringify({
            type: 'candidate_referral',
            title: 'Candidate Referral',
            message: `${referrerName} has referred ${name} (${phone}) via the portal`,
            icon: 'people-outline',
            color: '#10B981',
            linkType: 'contact',
            linkId: contactId,
            assignedTo,
          }),
        });
      } catch { /* non-critical */ }

      return jsonResponse(200, {
        success: true,
        referralId: insertResult.rows[0]?.id,
        registrationUrl,
        message: `Great — we'll reach out to ${name}! Share this link with them to speed things up.`,
      });
    }

    await db.end();
    return jsonResponse(405, { error: 'Method not allowed' });
  } catch (err) {
    console.error('❌ candidate-referral error:', err);
    try { await db.end(); } catch { /* ignore */ }
    return jsonResponse(500, { error: 'Internal server error.' });
  }
};
