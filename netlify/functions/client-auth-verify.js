/**
 * POST /netlify/functions/client-auth-verify
 * Body: { email: string, code: string }
 *
 * Validates the OTP, creates a 30-day session, and returns:
 * { token, client: { id, name, email, company } }
 */
const crypto = require('crypto');
const { getDbClient, rateLimit } = require('./db');
const { CORS_HEADERS } = require('./client-auth');

const SESSION_DAYS = 30;

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
  if (!normalised || !code) {
    return {
      statusCode: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Email and code are required.' }),
    };
  }

  // Rate-limit verify attempts: max 5 per 15 minutes
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

    // Find the OTP record
    const result = await db.query(
      `SELECT id, candidate_id, expires_at FROM verification_codes
        WHERE LOWER(TRIM(email)) = $1 AND code = $2 AND type = 'client_portal'
        LIMIT 1`,
      [normalised, code.trim()]
    );

    if (result.rows.length === 0) {
      await db.end();
      return {
        statusCode: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid code. Please check and try again.' }),
      };
    }

    const otp = result.rows[0];

    if (new Date(otp.expires_at) < new Date()) {
      await db.query('DELETE FROM verification_codes WHERE id = $1', [otp.id]);
      await db.end();
      return {
        statusCode: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Code has expired. Please request a new one.' }),
      };
    }

    // Consume OTP
    await db.query('DELETE FROM verification_codes WHERE id = $1', [otp.id]);

    // Fetch client details
    const clientResult = await db.query(
      `SELECT id, name, email, company, phone, assigned_to FROM contacts WHERE id = $1`,
      [otp.candidate_id]
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

    // Create session
    const token = generateSessionToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

    // Clean up expired sessions for this client
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

    console.log(`✅ Client portal session created for ${clientRow.id} (${clientRow.name})`);

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
    console.error('❌ client-auth-verify error:', err);
    try { await db.end(); } catch { /* ignore */ }
    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error. Please try again.' }),
    };
  }
};
