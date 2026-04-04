const { Client } = require('pg');

function getDbClient() {
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
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
