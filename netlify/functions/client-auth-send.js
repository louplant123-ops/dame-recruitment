/**
 * POST /netlify/functions/client-auth-send
 * Body: { email: string }
 *
 * Proxies to Railway which stores the OTP in verification_codes and sends
 * the email via Microsoft Graph (same DB + mail stack as DameDesk).
 */
const { rateLimit } = require('./db');
const { CORS_HEADERS } = require('./client-auth');

const RAILWAY_URL = process.env.RAILWAY_URL || 'https://damedesk-production.up.railway.app';

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

  const rl = rateLimit(`client-otp:${normalised}`, 3, 10 * 60 * 1000);
  if (!rl.allowed) {
    return {
      statusCode: 429,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Too many attempts. Please wait a few minutes before trying again.' }),
    };
  }

  try {
    const res = await fetch(`${RAILWAY_URL}/client-portal/auth/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalised }),
    });
    const data = await res.json().catch(() => ({}));

    // Keep the login page's generic success copy for 200 responses.
    if (res.ok) {
      return {
        statusCode: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          message: 'If this email is registered, you will receive a code.',
        }),
      };
    }

    return {
      statusCode: res.status,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify(data.error ? { error: data.error } : data),
    };
  } catch (err) {
    console.error('client-auth-send proxy error:', err.message);
    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error. Please try again.' }),
    };
  }
};
