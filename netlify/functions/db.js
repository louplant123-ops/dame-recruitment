const { Client } = require('pg');

/**
 * pg-connection-string can crash if both URL parse attempts fail: it leaves `result`
 * undefined then reads `result.searchParams`. That happens when DATABASE_URL is malformed.
 * Mirror its URL resolution and only pass strings that resolve to a valid URL object.
 */
function isParsablePostgresConnectionString(str) {
  if (!str || typeof str !== 'string') return false;
  const s = str.trim();
  if (!s) return false;
  if (s.charAt(0) === '/') return true;
  let result;
  try {
    try {
      result = new URL(s, 'postgres://base');
    } catch {
      result = new URL(s.replace('@/', '@___DUMMY___/'), 'postgres://base');
    }
  } catch {
    return false;
  }
  return !!(result && result.searchParams);
}

function getDbClient() {
  const rawUrl = process.env.DATABASE_URL;
  const databaseUrl = typeof rawUrl === 'string' ? rawUrl.trim() : '';
  const useConnectionString = databaseUrl && isParsablePostgresConnectionString(databaseUrl);

  if (databaseUrl && !useConnectionString) {
    console.warn(
      'DATABASE_URL is set but could not be parsed as a Postgres URL; using DB_HOST / DB_USER / DB_PASSWORD if present.'
    );
  }

  if (useConnectionString) {
    return new Client({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
    });
  }

  const host = process.env.DB_HOST || process.env.PGHOST;
  const port = process.env.DB_PORT || process.env.PGPORT;
  const database = process.env.DB_NAME || process.env.PGDATABASE;
  const user = process.env.DB_USER || process.env.PGUSER;
  const password = process.env.DB_PASSWORD || process.env.PGPASSWORD;

  if (!host || !password) {
    throw new Error('Database configuration missing. Set DATABASE_URL or DB_HOST/DB_USER/DB_PASSWORD environment variables.');
  }

  return new Client({
    host,
    port: port ? Number(port) : 25060,
    database: database || 'defaultdb',
    user: user || 'doadmin',
    password,
    ssl: { rejectUnauthorized: false },
  });
}

const rateLimitStore = new Map();

function rateLimit(key, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    rateLimitStore.set(key, { windowStart: now, count: 1 });
    return { allowed: true };
  }

  entry.count++;
  if (entry.count > maxRequests) {
    return { allowed: false, retryAfterMs: windowMs - (now - entry.windowStart) };
  }
  return { allowed: true };
}

module.exports = { getDbClient, rateLimit };
