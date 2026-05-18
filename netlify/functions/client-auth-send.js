/**
 * POST /netlify/functions/client-auth-send
 * Body: { email: string }
 *
 * Looks up the client by email address, generates a 6-digit OTP,
 * stores it in verification_codes, and sends it via email (SMTP).
 *
 * Always returns 200 to avoid email enumeration.
 */
const crypto = require('crypto');
const { getDbClient, rateLimit } = require('./db');
const { CORS_HEADERS, sendEmail } = require('./client-auth');

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let email;
  try {
    ({ email } = JSON.parse(event.body || '{}'));
  } catch {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const normalised = (email || '').trim().toLowerCase();
  if (!normalised || !normalised.includes('@')) {
    return {
      statusCode: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Please enter a valid email address.' }),
    };
  }

  // Rate-limit by email: max 3 OTPs per 10 minutes
  const rl = rateLimit(`client-otp:${normalised}`, 3, 10 * 60 * 1000);
  if (!rl.allowed) {
    return {
      statusCode: 429,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Too many attempts. Please wait a few minutes before trying again.' }),
    };
  }

  const SAFE_RESPONSE = {
    statusCode: 200,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify({ success: true, message: 'If this email is registered, you will receive a code.' }),
  };

  const db = getDbClient();
  try {
    await db.connect();

    // Look up client by email
    const result = await db.query(
      `SELECT id, name, email FROM contacts
        WHERE LOWER(TRIM(email)) = $1
          AND type = 'client'
        LIMIT 1`,
      [normalised]
    );

    if (result.rows.length === 0) {
      console.log(`🔒 Client portal login attempt for unknown email: ${normalised}`);
      await db.end();
      return SAFE_RESPONSE;
    }

    const client = result.rows[0];
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Remove previous unused OTPs for this client
    await db.query(
      `DELETE FROM verification_codes WHERE candidate_id = $1 AND type = 'client_portal'`,
      [client.id]
    );

    // Store OTP (reuse verification_codes table, candidate_id = client contact id)
    await db.query(
      `INSERT INTO verification_codes (email, code, expires_at, type, candidate_id, created_at)
       VALUES ($1, $2, $3, 'client_portal', $4, NOW())`,
      [normalised, otp, expiresAt.toISOString(), client.id]
    );

    await db.end();

    // Send email with OTP
    const firstName = (client.name || '').split(' ')[0] || 'there';
    await sendEmail(
      normalised,
      `Your Dame Recruitment sign-in code: ${otp}`,
      `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
        <div style="margin-bottom: 24px;">
          <span style="background: #C8102E; color: white; font-weight: 700; font-size: 13px;
            padding: 4px 10px; border-radius: 6px; letter-spacing: 0.5px;">DAME RECRUITMENT</span>
        </div>
        <h2 style="color: #1a1a1a; font-size: 22px; font-weight: 700; margin: 0 0 8px 0;">
          Hi ${firstName}, here's your sign-in code
        </h2>
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 28px 0;">
          Use the code below to access your client portal.
        </p>
        <div style="background: #f3f4f6; border-radius: 12px; padding: 20px 24px;
          text-align: center; margin: 0 0 24px 0;">
          <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #1a1a1a;">
            ${otp}
          </span>
        </div>
        <p style="color: #9ca3af; font-size: 12px; margin: 0; line-height: 1.6;">
          This code is valid for <strong>10 minutes</strong>. Do not share it with anyone.<br>
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
      `
    );

    console.log(`✅ Client OTP sent to ${normalised} for client ${client.id}`);
    return SAFE_RESPONSE;

  } catch (err) {
    console.error('❌ client-auth-send error:', err);
    try { await db.end(); } catch { /* ignore */ }
    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error. Please try again.' }),
    };
  }
};
