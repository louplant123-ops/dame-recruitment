/**
 * POST /netlify/functions/client-auth-verify
 * Body: { email: string, code: string }
 *
 * Validates the OTP stored by Railway (verification_codes.phone + hashed code),
 * then creates a 30-day client_sessions token for the Netlify portal APIs.
 */
const crypto = require('crypto');
const { getDbClient, rateLimit } = require('./db');
const { CORS_HEADERS } = require('./client-auth');

const SESSION_DAYS = 30;
const MAX_OTP_ATTEMPTS = 5;

function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let email, code;
  try {
    ({ email, code } = JSON.parse(event.body || '{}'));
  } catch {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const normalised = (email || '').trim().toLowerCase();
  const trimmedCode = String(code || '').trim();
  if (!normalised || !trimmedCode) {
    return {
      statusCode: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Email and code are required.' }),
    };
  }

  const rl = rateLimit(`client-verify:${normalised}`, 5, 15 * 60 * 1000);
  if (!rl.allowed) {
    return {
      statusCode: 429,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Too many attempts. Please request a new code.' }),
    };
  }

  const db = getDbClient();
  try {
    await db.connect();

    const codeHash = crypto.createHash('sha256').update(trimmedCode).digest('hex');
    const otpResult = await db.query(
      `SELECT phone, code, expires_at, attempts
         FROM verification_codes
        WHERE phone = $1 AND type = 'client_portal'
        LIMIT 1`,
      [normalised]
    );

    if (otpResult.rows.length === 0) {
      await db.end();
      return {
        statusCode: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid code. Please check and try again.' }),
      };
    }

    const otp = otpResult.rows[0];

    if (Number(otp.attempts || 0) >= MAX_OTP_ATTEMPTS) {
      await db.end();
      return {
        statusCode: 429,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Too many attempts. Please request a new code.' }),
      };
    }

    if (new Date(otp.expires_at) < new Date()) {
      await db.query(`DELETE FROM verification_codes WHERE phone = $1 AND type = 'client_portal'`, [normalised]);
      await db.end();
      return {
        statusCode: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Code has expired. Please request a new one.' }),
      };
    }

    if (otp.code !== codeHash) {
      await db.query(
        `UPDATE verification_codes SET attempts = attempts + 1 WHERE phone = $1 AND type = 'client_portal'`,
        [normalised]
      );
      await db.end();
      return {
        statusCode: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid code. Please check and try again.' }),
      };
    }

    await db.query(`DELETE FROM verification_codes WHERE phone = $1 AND type = 'client_portal'`, [normalised]);

    const clientResult = await db.query(
      `SELECT id, name, email, company, phone
         FROM contacts
        WHERE LOWER(TRIM(email)) = $1
        LIMIT 1`,
      [normalised]
    );

    if (clientResult.rows.length === 0) {
      await db.end();
      return {
        statusCode: 404,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Client account not found.' }),
      };
    }

    const clientRow = clientResult.rows[0];
    const token = generateSessionToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

    await db.query(
      `DELETE FROM client_sessions WHERE contact_id = $1 AND expires_at < NOW()`,
      [clientRow.id]
    );

    await db.query(
      `INSERT INTO client_sessions (contact_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [clientRow.id, tokenHash, expiresAt.toISOString()]
    );

    await db.end();

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        client: {
          id: clientRow.id,
          name: clientRow.name,
          email: clientRow.email,
          company: clientRow.company,
          phone: clientRow.phone,
        },
      }),
    };
  } catch (err) {
    console.error('client-auth-verify error:', err);
    try { await db.end(); } catch { /* ignore */ }
    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error. Please try again.' }),
    };
  }
};
