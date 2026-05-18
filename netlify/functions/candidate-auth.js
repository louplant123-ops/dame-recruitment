/**
 * Shared auth helper for candidate portal Netlify functions.
 * Validates the Authorization: Bearer <token> header against
 * candidate_sessions in the database.
 */
const crypto = require('crypto');
const { getDbClient } = require('./db');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

/**
 * Validate a portal session token.
 * Returns the contact_id string if valid, or null if invalid/expired.
 */
async function validateSession(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const db = getDbClient();
  try {
    await db.connect();
    const result = await db.query(
      `UPDATE candidate_sessions
          SET last_seen_at = NOW()
        WHERE token_hash = $1
          AND expires_at > NOW()
        RETURNING contact_id`,
      [tokenHash]
    );
    return result.rows[0]?.contact_id || null;
  } finally {
    try { await db.end(); } catch { /* ignore */ }
  }
}

/**
 * Standard unauthorised response.
 */
function unauthorised() {
  return {
    statusCode: 401,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: 'Not authenticated. Please log in.' }),
  };
}

/**
 * Standard CORS preflight response.
 */
function preflight() {
  return { statusCode: 200, headers: CORS_HEADERS, body: '' };
}

/**
 * Standard JSON response helper.
 */
function jsonResponse(statusCode, data) {
  return {
    statusCode,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
}

/**
 * Normalise a UK mobile number to E.164 (+44...).
 * Returns the normalised string, or null if it can't be parsed.
 */
function normalisePhone(raw) {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('44') && digits.length >= 12) return `+${digits}`;
  if (digits.startsWith('07') && digits.length === 11) return `+44${digits.slice(1)}`;
  if (digits.startsWith('7') && digits.length === 10) return `+44${digits}`;
  return null;
}

module.exports = { validateSession, unauthorised, preflight, jsonResponse, normalisePhone, CORS_HEADERS };
