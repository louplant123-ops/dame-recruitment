const { getDbClient, rateLimit } = require('./db');
const crypto = require('crypto');

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

async function parseMultipart(event) {
  const busboy = require('busboy');
  return new Promise((resolve, reject) => {
    const fields = {};
    const files = [];
    const bb = busboy({ headers: event.headers });

    bb.on('field', (name, val) => { fields[name] = val; });

    bb.on('file', (fieldname, file, info) => {
      const { filename, mimeType } = info;
      const chunks = [];
      file.on('data', (d) => chunks.push(d));
      file.on('end', () => {
        const buffer = Buffer.concat(chunks);
        files.push({ fieldName: fieldname, fileName: filename, mimeType, buffer, size: buffer.length });
      });
    });

    bb.on('finish', () => resolve({ fields, files }));
    bb.on('error', reject);
    bb.end(Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8'));
  });
}

exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders(), body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const clientIp = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown';
  const rl = rateLimit(`apply:${clientIp}`, 5, 60000);
  if (!rl.allowed) {
    return {
      statusCode: 429,
      headers: { ...corsHeaders(), 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) },
      body: JSON.stringify({ error: 'Too many submissions. Please try again later.' })
    };
  }

  try {
    console.log('📝 Job application received');

    // Parse body (multipart for CV or JSON fallback)
    let body = {};
    let cvFile = null;
    const contentType = event.headers['content-type'] || '';

    if (contentType.includes('multipart/form-data')) {
      const parsed = await parseMultipart(event);
      body = parsed.fields;
      const cv = parsed.files.find(f => f.fieldName === 'cv');
      if (cv) cvFile = cv;
    } else {
      body = JSON.parse(event.body);
    }

    const { fullName, email, phone, jobId, jobTitle } = body;

    // Validate required fields
    if (!fullName || !email || !phone) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'fullName, email and phone are required' }),
      };
    }

    const client = getDbClient();
    await client.connect();
    console.log('✅ DB connected');

    // 1. Create or find candidate contact
    const candidateId = `CAND_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Check if candidate already exists by email
    const existingRes = await client.query(
      `SELECT id, name FROM contacts WHERE email = $1 AND type = 'candidate' LIMIT 1`,
      [email]
    );

    let actualCandidateId;
    let candidateName = fullName;

    if (existingRes.rows.length > 0) {
      actualCandidateId = existingRes.rows[0].id;
      candidateName = existingRes.rows[0].name || fullName;
      console.log('📌 Existing candidate found:', actualCandidateId);
      // Update phone if changed
      await client.query(`UPDATE contacts SET phone = $1, updated_at = NOW() WHERE id = $2`, [phone, actualCandidateId]);
    } else {
      actualCandidateId = candidateId;
      await client.query(
        `INSERT INTO contacts (id, name, email, phone, type, source, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'candidate', 'website_job_application', 'active', NOW(), NOW())`,
        [candidateId, fullName, email, phone]
      );
      console.log('✨ New candidate created:', candidateId);
    }

    // 2. Save CV if uploaded (column is file_content — not "content" — per DameDesk schema)
    if (cvFile) {
      const docId = `DOC_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      await client.query(
        `INSERT INTO candidate_documents (id, contact_id, type, name, file_content, file_size, uploaded_date, uploaded_by, notes, created_at)
         VALUES ($1, $2, 'cv', $3, $4, $5, NOW(), 'website_job_apply', 'CV uploaded via job application', NOW())`,
        [docId, actualCandidateId, cvFile.fileName, cvFile.buffer.toString('base64'), cvFile.size]
      );
      console.log('✅ CV saved:', cvFile.fileName, `(${cvFile.size} bytes)`);
    }

    // 3. Create job application record
    if (jobId) {
      const appId = `JA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await client.query(
        `INSERT INTO job_applications (id, job_id, candidate_id, candidate_name, status, source, notes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'applied', 'website', $5, NOW(), NOW())`,
        [appId, jobId, actualCandidateId, candidateName, cvFile ? `CV: ${cvFile.fileName}` : null]
      );
      console.log('✅ Job application created:', appId, 'for job:', jobId);
    }

    // 4. Log activity
    const activityId = `ACT_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    await client.query(
      `INSERT INTO activities (id, subject_type, subject_id, type, summary, details, created_at)
       VALUES ($1, 'candidate', $2, 'job_application', $3, $4, NOW())`,
      [
        activityId,
        actualCandidateId,
        `Applied for ${jobTitle || 'a role'} via website`,
        { jobId, jobTitle, source: 'website', email, hasCV: !!cvFile },
      ]
    );

    await client.end();
    console.log('✅ Job application processed successfully');

    return {
      statusCode: 200,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Application submitted successfully',
        candidateId: actualCandidateId,
      }),
    };
  } catch (error) {
    console.error('❌ Job application error:', error);
    return {
      statusCode: 500,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: 'Failed to process application' }),
    };
  }
};
