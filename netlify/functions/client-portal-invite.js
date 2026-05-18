/**
 * POST /netlify/functions/client-portal-invite
 * Body: { clientId: string }
 * Headers: x-api-key (SERVER_API_KEY) — internal use only, called from Railway / Damedesk cadences
 *
 * Sends a "You now have portal access" email to the client.
 * Safe to call multiple times (idempotent — just re-sends the email).
 */
const { getDbClient } = require('./db');
const { sendEmail, CORS_HEADERS } = require('./client-auth');

const PORTAL_URL = process.env.CLIENT_PORTAL_URL || 'https://damerecruitment.co.uk/client';
const SERVER_API_KEY = process.env.SERVER_API_KEY || '';

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Require internal API key
  const apiKey = event.headers?.['x-api-key'] || event.headers?.['X-Api-Key'];
  if (SERVER_API_KEY && apiKey !== SERVER_API_KEY) {
    return { statusCode: 403, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Forbidden' }) };
  }

  let clientId;
  try {
    ({ clientId } = JSON.parse(event.body || '{}'));
  } catch {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  if (!clientId) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'clientId is required.' }) };
  }

  const db = getDbClient();
  try {
    await db.connect();

    const result = await db.query(
      `SELECT id, name, email, company FROM contacts WHERE id = $1 AND type = 'client'`,
      [clientId]
    );

    if (result.rows.length === 0) {
      await db.end();
      return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Client not found.' }) };
    }

    const client = result.rows[0];
    if (!client.email) {
      await db.end();
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Client has no email address.' }) };
    }

    await db.end();

    const firstName    = (client.name || '').split(' ')[0] || 'there';
    const companyName  = client.company || client.name || 'your company';

    await sendEmail(
      client.email,
      'Your Dame Recruitment client portal is ready',
      `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px;">
        <div style="margin-bottom: 28px;">
          <span style="background: #C8102E; color: white; font-weight: 700; font-size: 12px;
            padding: 4px 10px; border-radius: 6px; letter-spacing: 0.5px;">DAME RECRUITMENT</span>
        </div>

        <h2 style="color: #1a1a1a; font-size: 24px; font-weight: 800; margin: 0 0 12px 0; line-height: 1.2;">
          Hi ${firstName}, your client portal is ready
        </h2>

        <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
          You now have access to the <strong>${companyName}</strong> client portal
          — a live view of your workforce, timesheets to approve, invoices, and MI reports.
          No app download needed.
        </p>

        <div style="background: #f9fafb; border-radius: 12px; padding: 20px 24px; margin: 0 0 24px 0;">
          <p style="color: #374151; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">
            What you can do in the portal:
          </p>
          <ul style="color: #6b7280; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>See who's working for you this week and at what cost</li>
            <li>Approve or reject timesheets</li>
            <li>View your KIDs and right-to-work documents</li>
            <li>Check invoices and outstanding balances</li>
            <li>Pull fill rate and no-show MI reports</li>
            <li>Flag issues without phoning us</li>
          </ul>
        </div>

        <a href="${PORTAL_URL}"
          style="display: inline-block; background: #C8102E; color: white; font-weight: 700;
            font-size: 15px; padding: 14px 28px; border-radius: 10px; text-decoration: none;
            margin: 0 0 24px 0;">
          Open my portal →
        </a>

        <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 0;">
          To sign in, just enter this email address at <a href="${PORTAL_URL}" style="color: #C8102E;">${PORTAL_URL}</a>
          and we'll send you a one-time code. No password needed.<br><br>
          Questions? Reply to this email or call your consultant directly.
        </p>
      </div>
      `
    );

    console.log(`✅ Client portal invite sent to ${client.email} (${client.id})`);

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, sentTo: client.email }),
    };
  } catch (err) {
    console.error('❌ client-portal-invite error:', err);
    try { await db.end(); } catch { /* ignore */ }
    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to send invite email.' }),
    };
  }
};
