/**
 * Shared auth helper for client portal Netlify functions.
 * Validates the Authorization: Bearer <token> header against
 * client_sessions in the database.
 */
const crypto = require('crypto');
const { getDbClient } = require('./db');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

/**
 * Validate a client portal session token.
 * Returns the contact_id string if valid, or null if invalid/expired.
 */
async function validateClientSession(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const db = getDbClient();
  try {
    await db.connect();
    const result = await db.query(
      `UPDATE client_sessions
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

function unauthorised() {
  return {
    statusCode: 401,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: 'Not authenticated. Please log in.' }),
  };
}

function preflight() {
  return { statusCode: 200, headers: CORS_HEADERS, body: '' };
}

function jsonResponse(statusCode, data) {
  return {
    statusCode,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
}

/**
 * Send an email via nodemailer (SMTP). Uses the same env vars as other portal functions.
 */
async function sendEmail(to, subject, html) {
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'Dame Recruitment <noreply@damerecruitment.co.uk>',
    to,
    subject,
    html,
  });
}

module.exports = {
  validateClientSession,
  unauthorised,
  preflight,
  jsonResponse,
  sendEmail,
  CORS_HEADERS,
};
