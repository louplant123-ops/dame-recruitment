// Contact form with PostgreSQL database integration
const { getDbClient, rateLimit } = require('./db');

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getEnquirySummary(contactData) {
  if (contactData.contactType === 'candidate') {
    return 'Candidate enquiry received via website';
  }
  if (contactData.contactType === 'client') {
    return 'Client enquiry received via website';
  }
  return 'Prospect enquiry received via website';
}

function getFollowUpTaskType(contactData) {
  return contactData.contactType === 'candidate' ? 'candidate_followup' : 'client_followup';
}

function buildWebsiteNote(contactData) {
  const lines = [
    `Website enquiry received from ${contactData.name}`,
    contactData.company ? `Company: ${contactData.company}` : null,
    `Email: ${contactData.email}`,
    contactData.phone ? `Phone: ${contactData.phone}` : null,
    `Enquiry type: ${contactData.inquiryType || 'general'}`,
    '',
    contactData.message
  ].filter(Boolean);

  return lines.join('\n');
}

async function upsertExistingEmail(client, contactData) {
  const updateQuery = `
    UPDATE contacts
    SET
      name = $2,
      email = $1,
      phone = COALESCE($3, phone),
      company = COALESCE($4, company),
      type = $5,
      temperature = $6,
      notes = CASE
        WHEN COALESCE(notes, '') = '' THEN $7
        WHEN POSITION($7 IN notes) > 0 THEN notes
        ELSE CONCAT(
          notes,
          E'\\n\\n--- Website enquiry update ',
          TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI:SS'),
          E' ---\\n',
          $7
        )
      END,
      source = 'website_contact_form',
      last_contact = NOW(),
      updated_at = NOW()
    WHERE LOWER(email) = LOWER($1)
    RETURNING id, name, type, assigned_to
  `;

  const updateValues = [
    contactData.email,
    contactData.name,
    contactData.phone || null,
    contactData.company || null,
    contactData.contactType,
    contactData.temperature,
    contactData.message
  ];

  const result = await client.query(updateQuery, updateValues);
  return result.rows[0] || null;
}

async function createEnquiryArtifacts(client, savedContact, contactData) {
  const timelineNote = buildWebsiteNote(contactData);

  try {
    await client.query(
      `
        INSERT INTO activities (
          id, subject_type, subject_id, type, summary, channel, direction, user_name, details, created_at
        ) VALUES ($1, $2, $3, 'enquiry_received', $4, 'web', 'inbound', 'Website', $5, NOW())
      `,
      [
        createId('act'),
        savedContact.type || contactData.contactType,
        savedContact.id,
        getEnquirySummary(contactData),
        JSON.stringify({
          source: 'website_contact_form',
          inquiryType: contactData.inquiryType || 'general',
          name: contactData.name,
          email: contactData.email,
          phone: contactData.phone || null,
          company: contactData.company || null,
          message: contactData.message
        })
      ]
    );
  } catch (error) {
    console.warn('⚠️ Activity creation failed:', error.message);
  }

  try {
    await client.query(
      `
        INSERT INTO contact_notes (id, contact_id, content, note_type, created_by, created_at, updated_at)
        VALUES ($1, $2, $3, 'website_enquiry', 'Website', NOW(), NOW())
      `,
      [createId('note'), savedContact.id, timelineNote]
    );
  } catch (error) {
    console.warn('⚠️ Contact note creation failed:', error.message);
  }

  try {
    const taskTitle = contactData.contactType === 'candidate'
      ? `Follow up website candidate: ${contactData.name}`
      : `Follow up website enquiry: ${contactData.name}${contactData.company ? ` (${contactData.company})` : ''}`;
    const taskDescription = `${timelineNote}\n\nNext step: call or email this contact and qualify the enquiry.`;

    await client.query(
      `
        INSERT INTO tasks (id, title, description, type, priority, status, assigned_to, contact_id, due_date, created_at)
        VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7, NOW() + INTERVAL '4 hours', NOW())
      `,
      [
        createId('task'),
        taskTitle,
        taskDescription,
        getFollowUpTaskType(contactData),
        contactData.contactType === 'candidate' ? 'medium' : 'high',
        savedContact.assigned_to || null,
        savedContact.id
      ]
    );
  } catch (error) {
    console.warn('⚠️ Follow-up task creation failed:', error.message);
  }
}

// Store contact in database
async function storeInDatabase(contactData) {
  const client = getDbClient();

  try {
    console.log('🔄 Storing contact in database...');
    await client.connect();
    console.log('✅ Connected to database');

    const existingContact = await upsertExistingEmail(client, contactData);
    if (existingContact) {
      await createEnquiryArtifacts(client, existingContact, contactData);
      console.log('ℹ️ Existing contact found by email, updated record:', existingContact);
      return existingContact;
    }

    // Insert contact into contacts table
    const insertQuery = `
      INSERT INTO contacts (
        id, name, email, phone, company, type, status, temperature,
        notes, source, last_contact, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'active', $7, $8, 'website_contact_form', NOW(), NOW(), NOW())
      ON CONFLICT (id) 
      DO UPDATE SET 
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        company = EXCLUDED.company,
        type = EXCLUDED.type,
        temperature = EXCLUDED.temperature,
        notes = EXCLUDED.notes,
        last_contact = NOW(),
        updated_at = NOW()
      RETURNING id, name, type, assigned_to
    `;

    const values = [
      contactData.contactId,
      contactData.name,
      contactData.email,
      contactData.phone || null,
      contactData.company || null,
      contactData.contactType,
      contactData.temperature,
      contactData.message
    ];

    const result = await client.query(insertQuery, values);
    await createEnquiryArtifacts(client, result.rows[0], contactData);
    
    console.log('✅ Contact stored in database:', result.rows[0]);
    return result.rows[0];
    
  } catch (error) {
    if (error.code === '23505' && error.constraint === 'contacts_email_lower_unique') {
      console.warn('ℹ️ Duplicate email detected during insert, updating existing contact instead');
      const existingContact = await upsertExistingEmail(client, contactData);
      if (existingContact) {
        await createEnquiryArtifacts(client, existingContact, contactData);
        console.log('✅ Existing contact updated after duplicate email conflict:', existingContact);
        return existingContact;
      }
    }

    console.error('❌ Database storage error:', error);
    throw error;
  } finally {
    await client.end().catch(() => {});
  }
}

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const clientIp = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown';
  const rl = rateLimit(`contact:${clientIp}`, 5, 60000);
  if (!rl.allowed) {
    return {
      statusCode: 429,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json', 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) },
      body: JSON.stringify({ error: 'Too many submissions. Please try again later.' })
    };
  }

  try {
    console.log('📞 Contact form submission received');
    
    // Parse the form data
    let contactData;
    const contentType = event.headers['content-type'] || '';
    
    if (contentType.includes('application/json')) {
      contactData = JSON.parse(event.body);
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const params = new URLSearchParams(event.body);
      contactData = Object.fromEntries(params);
    } else {
      throw new Error('Unsupported content type');
    }

    console.log('📋 Contact data parsed:', {
      name: contactData.name,
      email: contactData.email,
      company: contactData.company || 'Not provided',
      inquiryType: contactData.inquiryType,
      hasMessage: !!contactData.message
    });

    // Validate required fields
    if (!contactData.name || !contactData.email || !contactData.message) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'Missing required fields: name, email, and message are required' 
        })
      };
    }

    // Check honeypot field (spam protection)
    if (contactData.website) {
      console.log('🚫 Honeypot field filled - blocking spam submission');
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Invalid submission' })
      };
    }

    // Generate contact ID
    const contactId = `CONTACT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Determine routing based on inquiry type
    let contactType = 'prospect'; // Default to prospect for general inquiries
    let temperature = 'warm';
    let message = 'General contact received';
    
    if (contactData.inquiryType === 'job_seeker') {
      contactType = 'candidate';
      temperature = 'warm';
      message = 'Job seeker contact - should go to Candidates page';
    } else if (contactData.inquiryType === 'employer') {
      contactType = 'prospect';
      temperature = 'hot';
      message = 'Employer inquiry - should go to Prospects page';
    }

    console.log('🎯 Contact routing:', {
      inquiryType: contactData.inquiryType,
      contactType: contactType,
      temperature: temperature
    });

    // Save to database
    const dataToStore = {
      contactId: contactId,
      name: contactData.name,
      email: contactData.email,
      phone: contactData.phone || null,
      company: contactData.company || null,
      message: contactData.message,
      contactType: contactType,
      temperature: temperature
    };

    const dbResult = await storeInDatabase(dataToStore);
    console.log('✅ Contact saved to database:', dbResult);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'Contact form submitted successfully',
        contactId: dbResult.id || contactId,
        contactType: contactType,
        routingMessage: message,
        savedToDatabase: true,
        dbRecord: dbResult
      })
    };

  } catch (error) {
    console.error('💥 Contact form error:', {
      message: error.message,
      stack: error.stack
    });
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to process contact form submission',
        details: error.message
      })
    };
  }
};
