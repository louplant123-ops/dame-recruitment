// Temp / agency CLIENT registration — public website form.
// Writes a `client` contact (source = website_temp_client_form) so it surfaces
// on the DameDesk Client Registrations dashboard, plus an activity, a follow-up
// task, a consultant notification, and a confirmation email to the client.
//
// Mirrors the proven pattern in job-posting.js / contact-form.js: getDbClient
// from ./db, email-safe upsert, fire-and-forget email + notification.
const { getDbClient, rateLimit } = require('./db');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SOURCE = 'website_temp_client_form';

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function asArray(v) {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string' && v.length) {
    try { const p = JSON.parse(v); if (Array.isArray(p)) return p; } catch { /* not json */ }
    return [v];
  }
  return [];
}

function buildNotes(d) {
  const roleTypes = asArray(d.roleTypes);
  const shiftTypes = asArray(d.shiftTypes);
  return [
    `Temp client registration — ${d.companyName}`,
    d.industry ? `Industry: ${d.industry}` : null,
    d.companySize ? `Company size: ${d.companySize}` : null,
    d.website ? `Website: ${d.website}` : null,
    roleTypes.length ? `Role types: ${roleTypes.join(', ')}` : null,
    shiftTypes.length ? `Shift types: ${shiftTypes.join(', ')}` : null,
    d.numberOfStaff ? `Workers needed: ${d.numberOfStaff}` : null,
    d.urgency ? `Urgency: ${d.urgency}` : null,
    (d.startTime || d.endTime) ? `Shift window: ${d.startTime || '?'}–${d.endTime || '?'}` : null,
    d.hourlyRate ? `Budget/rate: ${d.hourlyRate}` : null,
    d.paymentTerms ? `Payment terms: ${d.paymentTerms}` : null,
    d.multipleLocations ? `Multiple locations: ${d.multipleLocations}` : null,
    d.requirements ? `Requirements: ${d.requirements}` : null,
    d.healthSafety ? `H&S: ${d.healthSafety}` : null,
    d.additionalInfo ? `Additional: ${d.additionalInfo}` : null,
  ].filter(Boolean).join('\n');
}

async function upsertClientContact(client, d, notes) {
  // Dedupe by email when present so repeat submissions update one record and we
  // don't trip the contacts_email_lower_unique constraint.
  if (d.email) {
    const existing = await client.query(
      `SELECT id FROM contacts WHERE LOWER(email) = LOWER($1) LIMIT 1`,
      [d.email]
    );
    if (existing.rows.length > 0) {
      const id = existing.rows[0].id;
      await client.query(
        `UPDATE contacts SET
           name = $2, phone = COALESCE($3, phone), company = $4, type = 'client',
           temperature = 'hot', company_number = COALESCE($5, company_number),
           vat_number = COALESCE($6, vat_number),
           accounts_contact_name = COALESCE($7, accounts_contact_name),
           accounts_contact_email = COALESCE($8, accounts_contact_email),
           accounts_contact_phone = COALESCE($9, accounts_contact_phone),
           address = COALESCE($10, address), postcode = COALESCE($11, postcode),
           notes = CASE WHEN COALESCE(notes, '') = '' THEN $12
                        ELSE notes || E'\n\n--- Updated ' || TO_CHAR(NOW(),'YYYY-MM-DD HH24:MI') || E' ---\n' || $12 END,
           source = $13, last_contact = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [id, d.contactName, d.phone || null, d.companyName, d.companyNumber || null,
         d.vatNumber || null, d.accountsContactName || null, d.accountsContactEmail || null,
         d.accountsContactPhone || null, d.address || null, d.postcode || null, notes, SOURCE]
      );
      return id;
    }
  }

  const id = createId('CLIENT');
  await client.query(
    `INSERT INTO contacts (
       id, name, email, phone, company, type, status, temperature,
       company_number, vat_number,
       accounts_contact_name, accounts_contact_email, accounts_contact_phone,
       address, postcode, notes, source, last_contact, created_at, updated_at
     ) VALUES ($1,$2,$3,$4,$5,'client','active','hot',$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW(),NOW(),NOW())`,
    [id, d.contactName, d.email || null, d.phone || null, d.companyName,
     d.companyNumber || null, d.vatNumber || null,
     d.accountsContactName || null, d.accountsContactEmail || null, d.accountsContactPhone || null,
     d.address || null, d.postcode || null, buildNotes(d), SOURCE]
  );
  return id;
}

async function storeInDatabase(d) {
  const client = getDbClient();
  try {
    await client.connect();
    const notes = buildNotes(d);
    const contactId = await upsertClientContact(client, d, notes);

    // Activity timeline entry
    try {
      await client.query(
        `INSERT INTO activities (id, subject_type, subject_id, type, summary, channel, direction, user_name, details, created_at)
         VALUES ($1, 'client', $2, 'registration', $3, 'web', 'inbound', 'Website', $4, NOW())`,
        [createId('act'), contactId, `New temp client registration: ${d.companyName}`,
         JSON.stringify({ source: SOURCE, ...d })]
      );
    } catch (e) { console.warn('⚠️ activity insert failed:', e.message); }

    // Follow-up task (unassigned — manager/duty consultant picks up)
    try {
      await client.query(
        `INSERT INTO tasks (id, title, description, type, priority, status, assigned_to, contact_id, due_date, created_at, updated_at)
         VALUES ($1, $2, $3, 'client_followup', 'high', 'pending', NULL, $4, NOW() + INTERVAL '24 hours', NOW(), NOW())`,
        [createId('task'),
         `New temp client: ${d.companyName} — call to qualify`,
         `${d.contactName} from ${d.companyName} registered for temp staffing.\n\n${notes}\n\nNext: call ${d.phone || d.email || ''}, confirm requirements, send terms of business.`,
         contactId]
      );
    } catch (e) { console.warn('⚠️ task insert failed:', e.message); }

    return { contactId };
  } finally {
    await client.end().catch(() => {});
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: corsHeaders, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const ip = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown';
  const rl = rateLimit(`temp-client:${ip}`, 5, 60000);
  if (!rl.allowed) {
    return { statusCode: 429, headers: { ...corsHeaders, 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) },
      body: JSON.stringify({ error: 'Too many submissions. Please try again later.' }) };
  }

  try {
    let d;
    const ct = event.headers['content-type'] || '';
    if (ct.includes('application/json')) d = JSON.parse(event.body);
    else if (ct.includes('application/x-www-form-urlencoded')) d = Object.fromEntries(new URLSearchParams(event.body));
    else throw new Error('Unsupported content type');

    // Honeypot — real users never fill a hidden "website2" field.
    if (d.website2) return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ success: true }) };

    const required = ['companyName', 'industry', 'contactName', 'jobTitle', 'email', 'phone', 'address', 'postcode', 'urgency'];
    const missing = required.filter((f) => !d[f]);
    if (missing.length) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: `Missing required fields: ${missing.join(', ')}` }) };
    }

    const result = await storeInDatabase(d);

    sendConfirmationEmail(d).catch((e) => console.error('⚠️ Confirmation email failed:', e.message));
    notifyConsultants(d, result).catch((e) => console.error('⚠️ Consultant notification failed:', e.message));

    return { statusCode: 200, headers: corsHeaders,
      body: JSON.stringify({ success: true, message: 'Registration received. A member of our team will be in touch within 24 hours.', contactId: result.contactId }) };
  } catch (error) {
    console.error('💥 Temp client registration error:', error);
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ success: false, error: 'Registration processing failed. Please try again or contact us directly.' }) };
  }
};

async function notifyConsultants(d, result) {
  const serverUrl = process.env.TELNYX_SERVER_URL || process.env.SERVER_URL;
  if (!serverUrl) return;
  const headers = { 'Content-Type': 'application/json' };
  if (process.env.SERVER_API_KEY) headers['x-api-key'] = process.env.SERVER_API_KEY;
  await fetch(`${serverUrl}/notifications/create`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      type: 'client_registration',
      title: 'New Temp Client Registration',
      message: `${d.companyName} (${d.contactName}) registered for temp staffing. Industry: ${d.industry || 'N/A'}`,
      icon: 'business-outline',
      color: '#EF4444',
      linkType: 'contact',
      linkId: result.contactId,
    }),
  });
}

async function sendConfirmationEmail(d) {
  const { GRAPH_CLIENT_ID, GRAPH_CLIENT_SECRET, GRAPH_TENANT_ID, GRAPH_MAILBOX } = process.env;
  if (!GRAPH_CLIENT_ID || !GRAPH_CLIENT_SECRET || !GRAPH_TENANT_ID || !GRAPH_MAILBOX || !d.email) return;

  const tokenRes = await fetch(`https://login.microsoftonline.com/${GRAPH_TENANT_ID}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: GRAPH_CLIENT_ID, client_secret: GRAPH_CLIENT_SECRET, scope: 'https://graph.microsoft.com/.default', grant_type: 'client_credentials' }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) return;

  const firstName = (d.contactName || '').split(' ')[0] || 'there';
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 20px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
  <tr><td style="background:#dc2626;padding:28px 40px;text-align:center"><h1 style="margin:0;color:#fff;font-size:24px;font-weight:600">Dame Recruitment</h1></td></tr>
  <tr><td style="padding:36px 40px 20px">
    <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px">Hi ${firstName},</p>
    <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px">Thank you for registering <strong>${d.companyName}</strong> with Dame Recruitment. We've received your details and a member of our team will be in touch within 24 hours to discuss your staffing requirements.</p>
    <p style="color:#374151;font-size:15px;line-height:1.6;margin:20px 0 4px">Best regards,</p>
    <p style="color:#374151;font-size:15px;line-height:1.6;margin:0;font-weight:600">Dame Recruitment</p>
    <p style="color:#6b7280;font-size:14px;margin:2px 0 0">0330 043 5011 &middot; hello@damerecruitment.co.uk</p>
  </td></tr></table></td></tr></table></body></html>`;

  await fetch(`https://graph.microsoft.com/v1.0/users/${GRAPH_MAILBOX}/sendMail`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenData.access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: { subject: 'Registration Received — Dame Recruitment', body: { contentType: 'HTML', content: html }, toRecipients: [{ emailAddress: { address: d.email } }] } }),
  });
}
