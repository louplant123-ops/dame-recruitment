/**
 * POST /netlify/functions/candidate-auth-send
 * Body: { phone: string }
 *
 * Looks up the candidate by phone number, generates a 6-digit OTP,
 * stores it in verification_codes, and sends it via Telnyx SMS.
 *
 * Returns 200 { success: true } even when the phone isn't found
 * (to avoid phone enumeration).
 */
const crypto = require('crypto');
const { getDbClient, rateLimit } = require('./db');
const { CORS_HEADERS, normalisePhone } = require('./candidate-auth');

const RAILWAY_URL = process.env.RAILWAY_BACKEND_URL || 'https://damedesk-production.up.railway.app';
const SERVER_API_KEY = process.env.SERVER_API_KEY || '';

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendSms(to, text) {
  const res = await fetch(`${RAILWAY_URL}/send-sms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(SERVER_API_KEY ? { 'x-api-key': SERVER_API_KEY } : {}),
    },
    body: JSON.stringify({ to, message: text }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`SMS send failed (${res.status}): ${body}`);
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let phone;
  try {
    ({ phone } = JSON.parse(event.body || '{}'));
  } catch {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const normalised = normalisePhone(phone);
  if (!normalised) {
    return {
      statusCode: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Please enter a valid UK mobile number.' }),
    };
  }

  // Rate-limit by normalised phone: max 3 OTPs per 5 minutes
  const rl = rateLimit(`otp:${normalised}`, 3, 5 * 60 * 1000);
  if (!rl.allowed) {
    return {
      statusCode: 429,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Too many attempts. Please wait a few minutes before trying again.' }),
    };
  }

  const db = getDbClient();
  try {
    await db.connect();

    // Look up candidate — try E.164 and common local variants
    const stripped = normalised.replace('+44', '0');
    const result = await db.query(
      `SELECT id, name, phone FROM contacts
        WHERE type = 'candidate'
          AND (
            REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '(', '') = $1
            OR REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '(', '') = $2
            OR REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '(', '') = $3
          )
        LIMIT 1`,
      [normalised, stripped, normalised.replace('+', '')]
    );

    // Always respond with 200 — don't reveal whether the number exists
    if (result.rows.length === 0) {
      console.log(`📵 Portal login attempt for unknown number: ${normalised}`);
      await db.end();
      return {
        statusCode: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true, message: 'If this number is registered, you will receive a code.' }),
      };
    }

    const candidate = result.rows[0];
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Remove any previous unused OTPs for this candidate
    await db.query(
      `DELETE FROM verification_codes WHERE candidate_id = $1 AND type = 'candidate_portal'`,
      [candidate.id]
    );

    // Store new OTP (plain — low-value short-lived code)
    await db.query(
      `INSERT INTO verification_codes (email, code, expires_at, type, candidate_id, created_at)
       VALUES ($1, $2, $3, 'candidate_portal', $4, NOW())`,
      [normalised, otp, expiresAt.toISOString(), candidate.id]
    );

    await db.end();

    // Send SMS
    const firstName = (candidate.name || '').split(' ')[0];
    await sendSms(normalised, `Hi ${firstName}, your Dame Recruitment portal code is: ${otp}\n\nValid for 10 minutes. Do not share this code.`);

    console.log(`✅ OTP sent to ${normalised} for candidate ${candidate.id}`);

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, message: 'If this number is registered, you will receive a code.' }),
    };
  } catch (err) {
    console.error('❌ candidate-auth-send error:', err);
    try { await db.end(); } catch { /* ignore */ }
    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error. Please try again.' }),
    };
  }
};
