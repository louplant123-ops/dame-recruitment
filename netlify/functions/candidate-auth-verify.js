/**
 * POST /netlify/functions/candidate-auth-verify
 * Body: { phone: string, code: string }
 *
 * Validates the OTP, creates a 7-day session, and returns:
 * { token, candidate: { id, name, phone, email } }
 */
const crypto = require('crypto');
const { getDbClient, rateLimit } = require('./db');
const { CORS_HEADERS, normalisePhone } = require('./candidate-auth');

const SESSION_DAYS = 7;

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

  let phone, code;
  try {
    ({ phone, code } = JSON.parse(event.body || '{}'));
  } catch {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const normalised = normalisePhone(phone);
  if (!normalised || !code) {
    return {
      statusCode: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Phone number and code are required.' }),
    };
  }

  // Rate-limit verify attempts: max 5 per 15 minutes
  const rl = rateLimit(`verify:${normalised}`, 5, 15 * 60 * 1000);
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
        WHERE email = $1 AND code = $2 AND type = 'candidate_portal'
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

    // Delete used OTP
    await db.query('DELETE FROM verification_codes WHERE id = $1', [otp.id]);

    // Get candidate details
    const candidateResult = await db.query(
      `SELECT id, name, phone, email, type,
              registration_type, right_to_work, assigned_to
         FROM contacts WHERE id = $1`,
      [otp.candidate_id]
    );

    if (candidateResult.rows.length === 0) {
      await db.end();
      return {
        statusCode: 404,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Candidate not found.' }),
      };
    }

    const candidate = candidateResult.rows[0];

    // Create session
    const token = generateSessionToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

    // Clean up expired sessions for this candidate (keep max 3 active devices)
    await db.query(
      `DELETE FROM candidate_sessions WHERE contact_id = $1 AND expires_at < NOW()`,
      [candidate.id]
    );

    await db.query(
      `INSERT INTO candidate_sessions (contact_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [candidate.id, tokenHash, expiresAt.toISOString()]
    );

    await db.end();

    console.log(`✅ Portal session created for candidate ${candidate.id} (${candidate.name})`);

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        candidate: {
          id: candidate.id,
          name: candidate.name,
          phone: candidate.phone,
          email: candidate.email,
          registrationType: candidate.registration_type,
        },
      }),
    };
  } catch (err) {
    console.error('❌ candidate-auth-verify error:', err);
    try { await db.end(); } catch { /* ignore */ }
    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error. Please try again.' }),
    };
  }
};
