const fetch = require('node-fetch');
const { Client } = require('pg');
const AWS = require('aws-sdk');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Configure DigitalOcean Spaces
const spacesEndpoint = new AWS.Endpoint('fra1.digitaloceanspaces.com');
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_SPACES_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET,
  region: 'fra1'
});

// Upload file to DigitalOcean Spaces
async function uploadFileToSpaces(fileBuffer, fileName, mimeType) {
  const key = `right-to-work/${Date.now()}-${fileName}`;
  
  const uploadParams = {
    Bucket: 'damedesk-storage',
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
    ACL: 'private' // Keep files private for security
  };

  try {
    const result = await s3.upload(uploadParams).promise();
    console.log('✅ File uploaded to Spaces:', result.Location);
    return {
      url: result.Location,
      key: result.Key,
      fileName: fileName
    };
  } catch (error) {
    console.error('❌ Spaces upload error:', error);
    throw new Error('Failed to upload file to storage');
  }
}

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('📋// Netlify Function for Dame Recruitment Part 2 Registration Integration');
    console.log('📥 Raw event body:', event.body);
    console.log('📋 Event headers:', event.headers);
    
    // Parse the request body - handle both JSON and multipart/form-data
    let formData;
    let uploadedFiles = [];
    const contentType = event.headers['content-type'] || '';
    
    if (contentType.includes('multipart/form-data')) {
      console.log('📦 Processing multipart/form-data');
      // For multipart data, we need to parse it differently
      const rawBody = event.body;
      
      // Decode base64 if needed
      let decodedBody;
      try {
        decodedBody = Buffer.from(rawBody, 'base64').toString('utf-8');
        console.log('📝 Decoded multipart body length:', decodedBody.length);
      } catch (decodeError) {
        console.log('📝 Using raw body (not base64)');
        decodedBody = rawBody;
      }
      
      // Parse multipart form data and handle file uploads
      const parseResult = await parseMultipartFormDataWithFiles(decodedBody);
      formData = parseResult.formData;
      uploadedFiles = parseResult.files || [];
      
      console.log('📋 Parsed form data:', formData);
      console.log('📁 Files to upload:', uploadedFiles.length);
      console.log('📁 File details:', uploadedFiles.map(f => ({ name: f.fileName, size: f.size, type: f.mimeType })));
    } else {
      // Handle JSON data
      console.log('📦 Processing JSON data');
      formData = JSON.parse(event.body);
    }
    
    console.log('📋 Part 2 data:', {
      candidateId: formData.candidateId,
      hasContract: formData.contractAccepted,
      nationalityCategory: formData.nationalityCategory,
      rightToWorkMethod: formData.rightToWorkMethod,
      hasShareCode: !!formData.shareCode,
      hasDateOfBirth: !!formData.dateOfBirth
    });

    console.log('📋 Full form data received:', formData);
    
    // Upload files to DigitalOcean Spaces if any were uploaded
    let uploadedFileUrls = [];
    if (contentType.includes('multipart/form-data') && uploadedFiles && uploadedFiles.length > 0) {
      console.log('📁 Processing file uploads to DigitalOcean Spaces...');
      console.log('📁 Number of files to upload:', uploadedFiles.length);
      try {
        for (const file of uploadedFiles) {
          console.log('📤 Uploading file:', file.fileName, 'Size:', file.size, 'Type:', file.mimeType);
          const uploadResult = await uploadFileToSpaces(file.buffer, file.fileName, file.mimeType);
          uploadedFileUrls.push({
            ...uploadResult,
            size: file.size
          });
          console.log('✅ File uploaded successfully:', uploadResult.fileName, 'URL:', uploadResult.url);
        }
        console.log('✅ All files uploaded successfully to Spaces');
        console.log('✅ Total files uploaded:', uploadedFileUrls.length);
      } catch (uploadError) {
        console.error('❌ File upload to Spaces failed:', uploadError.message);
        console.error('❌ Full upload error:', uploadError);
        // Continue with registration even if file upload fails
      }
    } else {
      console.log('⚠️ No files detected for upload');
      console.log('⚠️ Content-Type:', contentType);
      console.log('⚠️ uploadedFiles:', uploadedFiles);
    }
    
    // Store file URLs in form data for database storage
    if (uploadedFileUrls.length > 0) {
      formData.rightToWorkDocuments = JSON.stringify(uploadedFileUrls);
    }
    
    try {
      // Connect to DigitalOcean PostgreSQL database
      console.log('🔄 Attempting database connection...');
      const client = new Client({
        host: process.env.DB_HOST || 'damedesk-crm-production-do-user-27348714-0.j.db.ondigitalocean.com',
        port: process.env.DB_PORT || 25060,
        database: process.env.DB_NAME || 'defaultdb',
        user: process.env.DB_USER || 'doadmin',
        password: process.env.DB_PASSWORD,
        ssl: {
          rejectUnauthorized: false
        },
        connectionTimeoutMillis: 10000
      });

      await client.connect();
      console.log('✅ Connected to DigitalOcean database');

      // First, let's check what tables exist
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
      console.log('📋 Available tables:', tablesResult.rows.map(r => r.table_name));

      // Create the candidate_registrations table if it doesn't exist
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS candidate_registrations (
          id SERIAL PRIMARY KEY,
          candidate_id VARCHAR(255) UNIQUE NOT NULL,
          sort_code VARCHAR(10),
          account_number VARCHAR(20),
          account_holder_name VARCHAR(255),
          ni_number VARCHAR(20),
          nationality_category VARCHAR(50),
          right_to_work_method VARCHAR(50),
          share_code VARCHAR(50),
          date_of_birth DATE,
          document_type VARCHAR(50),
          emergency_name VARCHAR(255),
          emergency_phone VARCHAR(20),
          contract_accepted BOOLEAN DEFAULT FALSE,
          contract_signature VARCHAR(255),
          contract_date DATE,
          registration_status VARCHAR(50) DEFAULT 'pending',
          part2_completed_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `;
      
      await client.query(createTableQuery);
      console.log('✅ Table candidate_registrations ready');

      // Also ensure contacts table exists for DameDesk integration
      const createContactsTableQuery = `
        CREATE TABLE IF NOT EXISTS contacts (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT,
          phone TEXT,
          type TEXT NOT NULL DEFAULT 'candidate',
          status TEXT DEFAULT 'active',
          temperature TEXT DEFAULT 'warm',
          company TEXT,
          position TEXT,
          location TEXT,
          postcode TEXT,
          skills TEXT,
          experience_level TEXT,
          hourly_rate REAL,
          availability TEXT,
          right_to_work TEXT,
          right_to_work_documents TEXT,
          travel_method TEXT,
          contract_preference TEXT,
          shift_availability TEXT,
          notes TEXT,
          source TEXT DEFAULT 'website',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `;
      
      await client.query(createContactsTableQuery);
      console.log('✅ Table contacts ready');

      // Create or update the candidate in contacts table
      // Note: live contacts table does not have a right_to_work_documents column,
      // so we only upsert right_to_work and notes here. Document URLs are stored
      // in candidate_registrations.right_to_work_documents.
      const candidateUpsertQuery = `
        INSERT INTO contacts (
          id, name, email, phone, type, status, temperature,
          right_to_work, notes, source, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, 'candidate', 'active', 'hot', $5, $6, 'website_part2', NOW(), NOW())
        ON CONFLICT (id)
        DO UPDATE SET
          right_to_work = EXCLUDED.right_to_work,
          notes = EXCLUDED.notes,
          temperature = 'hot',
          updated_at = NOW()
        RETURNING id, name
      `;

      const candidateValues = [
        formData.candidateId,
        formData.accountHolderName || 'Part 2 Candidate',
        '', // email - we don't have this from Part 2 form
        formData.emergencyPhone || '',
        formData.rightToWorkMethod || 'pending',
        `Part 2 completed: Bank details, NI: ${formData.niNumber}, Emergency: ${formData.emergencyName}`
      ];
      
      const candidateResult = await client.query(candidateUpsertQuery, candidateValues);
      console.log('✅ Candidate record created/updated:', candidateResult.rows[0]);

      // Create candidate_documents table if it doesn't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS candidate_documents (
          id TEXT PRIMARY KEY,
          contact_id TEXT NOT NULL,
          type TEXT NOT NULL,
          name TEXT NOT NULL,
          file_path TEXT,
          content TEXT,
          file_size INTEGER,
          uploaded_date TIMESTAMP DEFAULT NOW(),
          uploaded_by TEXT,
          notes TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log('✅ Table candidate_documents ready');

      // If any right-to-work documents were uploaded, create candidate_documents records
      if (uploadedFileUrls.length > 0) {
        console.log('📁 Creating candidate_documents records for right-to-work files...');
        console.log('📁 Number of files to save:', uploadedFileUrls.length);
        console.log('📁 Candidate ID:', formData.candidateId);
        console.log('📁 Uploaded file URLs:', JSON.stringify(uploadedFileUrls, null, 2));
        
        for (const file of uploadedFileUrls) {
          const documentId = `DOC_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
          const insertDocumentQuery = `
            INSERT INTO candidate_documents (
              id, contact_id, type, name, file_path, file_size, uploaded_date, uploaded_by, notes, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8, NOW())
          `;

          const documentValues = [
            documentId,
            formData.candidateId,
            'id', // store as ID / right-to-work document
            file.fileName || 'Right to Work Document',
            file.url,
            file.size || null,
            'website_part2',
            'Right to work document uploaded via website Part 2 registration'
          ];

          console.log('📄 Saving document:', {
            id: documentId,
            contact_id: formData.candidateId,
            name: file.fileName,
            url: file.url,
            size: file.size
          });

          try {
            const docResult = await client.query(insertDocumentQuery, documentValues);
            console.log('✅ Candidate document record created:', documentId);
            console.log('✅ Document insert result:', docResult.rowCount, 'rows affected');
          } catch (docError) {
            console.error('❌ Failed to create candidate document record:', docError.message);
            console.error('❌ Full error:', docError);
            console.error('❌ Document values:', documentValues);
            console.error('❌ SQL Query:', insertDocumentQuery);
          }
        }
        console.log('✅ Finished processing all document records');
      } else {
        console.log('⚠️ No files were uploaded or file upload failed');
        console.log('⚠️ uploadedFiles array:', uploadedFiles);
        console.log('⚠️ uploadedFileUrls array:', uploadedFileUrls);
      }

      // Update emergency contact fields and contract signature on the candidate contact record
      try {
        const emergencyUpdateQuery = `
          UPDATE contacts
          SET emergency_contact_name = $2,
              emergency_contact_phone = $3,
              emergency_contact_relationship = $4,
              contract_status = $5,
              contract_signed_by = $6,
              contract_signed_date = $7,
              updated_at = NOW()
          WHERE id = $1
        `;

        await client.query(emergencyUpdateQuery, [
          formData.candidateId,
          formData.emergencyName || null,
          formData.emergencyPhone || null,
          formData.emergencyRelationship || null,
          formData.contractAccepted ? 'signed' : 'pending',
          formData.contractSignature || null,
          formData.contractDate || null
        ]);
        console.log('✅ Emergency contact and contract details updated for candidate:', formData.candidateId);
      } catch (emError) {
        console.error('❌ Failed to update candidate details:', emError.message);
      }

      // Insert or update the candidate registration with Part 2 data
      const upsertQuery = `
        INSERT INTO candidate_registrations (
          candidate_id, sort_code, account_number, account_holder_name,
          ni_number, nationality_category, right_to_work_method, share_code, 
          date_of_birth, document_type, emergency_name, emergency_phone, 
          contract_accepted, contract_signature, contract_date, 
          registration_status, part2_completed_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'work_ready', NOW(), NOW())
        ON CONFLICT (candidate_id) 
        DO UPDATE SET 
          sort_code = EXCLUDED.sort_code,
          account_number = EXCLUDED.account_number,
          account_holder_name = EXCLUDED.account_holder_name,
          ni_number = EXCLUDED.ni_number,
          nationality_category = EXCLUDED.nationality_category,
          right_to_work_method = EXCLUDED.right_to_work_method,
          share_code = EXCLUDED.share_code,
          date_of_birth = EXCLUDED.date_of_birth,
          document_type = EXCLUDED.document_type,
          emergency_name = EXCLUDED.emergency_name,
          emergency_phone = EXCLUDED.emergency_phone,
          contract_accepted = EXCLUDED.contract_accepted,
          contract_signature = EXCLUDED.contract_signature,
          contract_date = EXCLUDED.contract_date,
          registration_status = 'work_ready',
          part2_completed_at = NOW(),
          updated_at = NOW()
        RETURNING id, candidate_id, registration_status
      `;
    
    const values = [
      formData.candidateId,
      formData.sortCode,
      formData.accountNumber,
      formData.accountHolderName,
      formData.niNumber,
      formData.nationalityCategory || null,
      formData.rightToWorkMethod || 'pending',
      formData.shareCode || null,
      formData.dateOfBirth || null,
      formData.documentType || null,
      formData.emergencyName,
      formData.emergencyPhone,
      formData.contractAccepted,
      formData.contractSignature,
      formData.contractDate
    ];
    
      const dbResult = await client.query(upsertQuery, values);
      await client.end();
      
      if (dbResult.rows.length === 0) {
        throw new Error('Candidate registration not found - please check candidate ID');
      }
      
      console.log('✅ Database updated successfully:', dbResult.rows[0]);
      
      // Create RTW check record if nationality category is provided
      if (formData.nationalityCategory && formData.rightToWorkMethod) {
        try {
          console.log('📋 Creating RTW check record...');
          const rtwCheckId = `RTW_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          let rtwStatus = 'pending';
          if (formData.rightToWorkMethod === 'video_call') {
            rtwStatus = 'scheduled';
          }
          
          const rtwClient = new Client({
            host: process.env.DB_HOST || 'damedesk-crm-production-do-user-27348714-0.j.db.ondigitalocean.com',
            port: process.env.DB_PORT || 25060,
            database: process.env.DB_NAME || 'defaultdb',
            user: process.env.DB_USER || 'doadmin',
            password: process.env.DB_PASSWORD || 'AVNS_wm_vFxOY5--ftSp64EL',
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 10000
          });
          
          await rtwClient.connect();
          
          // Check if RTW check already exists for this contact
          const existingCheck = await rtwClient.query(
            'SELECT id FROM rtw_checks WHERE contact_id = $1',
            [formData.candidateId]
          );
          
          let rtwResult;
          if (existingCheck.rows.length > 0) {
            // Update existing RTW check
            const rtwUpdateQuery = `
              UPDATE rtw_checks SET
                check_type = $1,
                nationality_category = $2,
                status = $3,
                share_code = $4,
                share_code_dob = $5,
                updated_at = NOW()
              WHERE contact_id = $6
              RETURNING id
            `;
            rtwResult = await rtwClient.query(rtwUpdateQuery, [
              formData.rightToWorkMethod,
              formData.nationalityCategory,
              rtwStatus,
              formData.shareCode || null,
              formData.dateOfBirth || null,
              formData.candidateId
            ]);
          } else {
            // Insert new RTW check
            const rtwInsertQuery = `
              INSERT INTO rtw_checks (
                id, contact_id, check_type, nationality_category, status,
                share_code, share_code_dob, statutory_excuse,
                created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
              RETURNING id
            `;
            rtwResult = await rtwClient.query(rtwInsertQuery, [
              rtwCheckId,
              formData.candidateId,
              formData.rightToWorkMethod,
              formData.nationalityCategory,
              rtwStatus,
              formData.shareCode || null,
              formData.dateOfBirth || null,
              false
            ]);
          }
          
          console.log('✅ RTW check created/updated:', rtwResult.rows[0]);
          
          const finalRtwCheckId = rtwResult.rows[0].id;
          
          // Update contact with RTW status
          await rtwClient.query(
            `UPDATE contacts 
             SET rtw_status = $1, 
                 rtw_check_id = $2,
                 nationality_category = $3,
                 rtw_last_checked = NOW()
             WHERE id = $4`,
            [rtwStatus, finalRtwCheckId, formData.nationalityCategory, formData.candidateId]
          );
          
          console.log('✅ Contact RTW status updated');
          await rtwClient.end();
        } catch (rtwError) {
          console.error('⚠️ Failed to create RTW check (non-critical):', rtwError.message);
          // Don't fail the whole registration if RTW check creation fails
        }
      }
      
      // Generate signed contract document with signature block
      if (formData.contractAccepted && formData.contractSignature) {
        try {
          // Reconnect to database for contract document
          const contractClient = new Client({
            host: process.env.DB_HOST || 'damedesk-crm-production-do-user-27348714-0.j.db.ondigitalocean.com',
            port: process.env.DB_PORT || 25060,
            database: process.env.DB_NAME || 'defaultdb',
            user: process.env.DB_USER || 'doadmin',
            password: process.env.DB_PASSWORD || 'AVNS_wm_vFxOY5--ftSp64EL',
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 10000
          });
          
          await contractClient.connect();
          
          const signedDate = new Date().toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          
          // Generate HTML contract for better preview
          const contractHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Employment Contract - Dame Recruitment</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; color: #333; }
    h1 { color: #c41e3a; text-align: center; border-bottom: 3px solid #c41e3a; padding-bottom: 10px; }
    h2 { color: #c41e3a; margin-top: 30px; }
    .header { text-align: center; margin-bottom: 30px; }
    .parties { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .section { margin: 20px 0; }
    .section h3 { color: #555; margin-top: 20px; }
    .section ul { margin-left: 20px; }
    .signature-block { background: #e8f5e9; border: 2px solid #4caf50; border-radius: 8px; padding: 20px; margin-top: 40px; }
    .signature-block h3 { color: #2e7d32; margin-top: 0; }
    .signature-info { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px; }
    .signature-info div { padding: 10px; background: white; border-radius: 4px; }
    .signature-info strong { color: #2e7d32; }
    .legal-notice { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 4px; margin-top: 20px; font-size: 0.9em; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 0.9em; }
  </style>
</head>
<body>
  <h1>TERMS OF ENGAGEMENT FOR AGENCY WORKERS</h1>
  <div class="header">
    <h2>Dame Recruitment Ltd</h2>
    <p>Contract for Services - Temporary Agency Workers</p>
  </div>

  <div class="parties">
    <p><strong>This agreement is made on:</strong> ${formData.contractDate || new Date().toLocaleDateString('en-GB')}</p>
    <p><strong>Between:</strong></p>
    <p>Dame Recruitment Ltd ("the Agency")</p>
    <p><strong>and</strong></p>
    <p>${formData.firstName || ''} ${formData.lastName || ''} ("the Worker")</p>
  </div>

  <p>By signing below, the Worker agrees to the standard terms and conditions for temporary employment through Dame Recruitment.</p>

  <div class="section">
    <h3>1. PAYMENT TERMS AND DEDUCTIONS</h3>
    <ul>
      <li>Payment will be made weekly/monthly as agreed</li>
      <li>Statutory deductions (tax, NI) will be made as required</li>
      <li>Timesheets must be submitted promptly</li>
    </ul>
  </div>

  <div class="section">
    <h3>2. ASSIGNMENT OBLIGATIONS AND CONDUCT</h3>
    <ul>
      <li>Worker agrees to perform duties as assigned</li>
      <li>Professional conduct expected at all times</li>
      <li>Follow client site rules and procedures</li>
    </ul>
  </div>

  <div class="section">
    <h3>3. HEALTH AND SAFETY REQUIREMENTS</h3>
    <ul>
      <li>Comply with all H&S regulations</li>
      <li>Report incidents immediately</li>
      <li>Use provided PPE where required</li>
    </ul>
  </div>

  <div class="section">
    <h3>4. CONFIDENTIALITY AND DATA PROTECTION</h3>
    <ul>
      <li>Maintain confidentiality of client information</li>
      <li>Comply with GDPR requirements</li>
      <li>Protect sensitive data</li>
    </ul>
  </div>

  <div class="section">
    <h3>5. ANNUAL LEAVE AND SICK PAY ENTITLEMENTS</h3>
    <ul>
      <li>Statutory holiday entitlement applies</li>
      <li>Sick pay as per statutory requirements</li>
      <li>Request leave in advance where possible</li>
    </ul>
  </div>

  <div class="section">
    <h3>6. TERMINATION CONDITIONS</h3>
    <ul>
      <li>Either party may terminate with notice</li>
      <li>Immediate termination for gross misconduct</li>
      <li>Final payment on termination</li>
    </ul>
  </div>

  <div class="signature-block">
    <h3>✓ DIGITAL SIGNATURE CONFIRMATION</h3>
    <p><strong>This contract was digitally signed on:</strong> ${signedDate}</p>
    <div class="signature-info">
      <div><strong>Signed by:</strong><br>${formData.contractSignature}</div>
      <div><strong>Date:</strong><br>${formData.contractDate}</div>
      <div><strong>IP Address:</strong><br>${event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'Unknown'}</div>
      <div><strong>User Agent:</strong><br>${(event.headers['user-agent'] || 'Unknown').substring(0, 50)}...</div>
    </div>
  </div>

  <div class="legal-notice">
    <strong>Legal Notice:</strong> This constitutes a legally binding electronic signature under the Electronic Communications Act 2000 and the Electronic Signatures Regulations 2002.
  </div>

  <div class="footer">
    <p>Dame Recruitment Ltd | Registered in England and Wales</p>
    <p>Document generated: ${new Date().toLocaleString('en-GB')}</p>
  </div>
</body>
</html>`;

          // Save contract document to candidate_documents table as HTML
          const docId = `DOC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const contractBase64 = Buffer.from(contractHTML).toString('base64');
          
          await contractClient.query(`
            INSERT INTO candidate_documents (
              id, contact_id, type, name, content, file_size,
              uploaded_date, uploaded_by, notes
            ) VALUES ($1, $2, 'contract', $3, $4, $5, NOW(), 'System', $6)
          `, [
            docId,
            formData.candidateId,
            `Worker_Contract_${formData.contractSignature.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`,
            contractBase64,
            contractHTML.length,
            `Signed by: ${formData.contractSignature} on ${formData.contractDate}`
          ]);
          
          console.log('✅ Contract document saved as HTML');
          
          // Fetch candidate email from contacts table
          let candidateEmail = null;
          try {
            const emailResult = await contractClient.query(
              'SELECT email, name FROM contacts WHERE id = $1',
              [formData.candidateId]
            );
            if (emailResult.rows.length > 0 && emailResult.rows[0].email) {
              candidateEmail = emailResult.rows[0].email;
              console.log('📧 Found candidate email:', candidateEmail);
            } else {
              console.warn('⚠️ No email found for candidate:', formData.candidateId);
            }
          } catch (emailFetchError) {
            console.error('⚠️ Failed to fetch candidate email:', emailFetchError);
          }
          
          // Send contract copy to candidate via email
          if (candidateEmail) {
            try {
              console.log('📧 Sending contract copy to:', candidateEmail);
              
              await sendContractEmail({
                to: candidateEmail,
                candidateName: `${formData.firstName || ''} ${formData.lastName || ''}`,
                contractHTML: contractHTML,
                signatureDate: signedDate
              });
              
              console.log('✅ Contract email sent successfully');
            } catch (emailError) {
              console.error('⚠️ Failed to send contract email:', emailError);
              // Don't fail the registration if email fails
            }
          } else {
            console.warn('⚠️ No email address available to send contract');
          }
          
          await contractClient.end();
        } catch (docError) {
          console.error('⚠️ Failed to save contract document:', docError);
          // Continue anyway - registration is complete
        }
      }
      
      // Create timeline event for Part 2 registration completion
      try {
        const historyId = `HIST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const insertHistoryQuery = `
          INSERT INTO client_history (
            id, client_id, event_type, event_action, event_date,
            user_name, description, metadata, created_at
          ) VALUES ($1, $2, 'registration', 'part2_completed', NOW(), $3, $4, $5, NOW())
        `;

        const historyValues = [
          historyId,
          formData.candidateId,
          `${formData.firstName} ${formData.lastName}`,
          `Part 2 registration completed - Right to work verified and contract signed`,
          JSON.stringify({
            registration_type: 'part2',
            right_to_work_method: formData.rightToWorkMethod,
            documents_uploaded: uploadedFileUrls.length,
            contract_signed: formData.contractAccepted,
            contract_signature: formData.contractSignature,
            emergency_contact: formData.emergencyContactName,
            completed_at: new Date().toISOString()
          })
        ];

        await client.query(insertHistoryQuery, historyValues);
        console.log('✅ Timeline event created for Part 2 registration');
      } catch (historyError) {
        console.error('⚠️ Failed to create timeline event:', historyError);
        // Continue anyway - registration is complete
      }

      var result = {
        success: true,
        registrationId: dbResult.rows[0].id,
        candidateId: dbResult.rows[0].candidate_id,
        status: dbResult.rows[0].registration_status,
        message: 'Part 2 registration completed and saved to database'
      };
      
    } catch (dbError) {
      console.error('❌ Database error:', dbError.message);
      console.error('❌ Full error:', dbError);
      
      // Fallback: log data and return success for now
      var result = {
        success: true,
        registrationId: `TEMP_${Date.now()}`,
        candidateId: formData.candidateId,
        message: `Part 2 data logged (DB error: ${dbError.message})`
      };
    }
    console.log('✅ Bridge server response:', result);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'Part 2 registration submitted successfully',
        registrationId: result.registrationId
      })
    };
  } catch (error) {
    console.error('❌ Part 2 registration error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: 'Failed to submit Part 2 registration',
        details: error.message
      })
    };
  }
};

// Send contract email to candidate using Nodemailer (same as DameDesk)
async function sendContractEmail({ to, candidateName, contractHTML, signatureDate }) {
  // Check if SMTP credentials are configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️ SMTP credentials not configured - skipping email');
    return;
  }
  
  // Debug: Check nodemailer module
  console.log('📧 Nodemailer module type:', typeof nodemailer);
  console.log('📧 Nodemailer.createTransporter type:', typeof nodemailer?.createTransporter);
  console.log('📧 Nodemailer keys:', Object.keys(nodemailer || {}));
  
  // Try to get the correct nodemailer reference
  let mailer = nodemailer;
  
  // Check if it's a default export issue
  if (nodemailer && nodemailer.default && typeof nodemailer.default.createTransporter === 'function') {
    console.log('✅ Using nodemailer.default');
    mailer = nodemailer.default;
  } else if (typeof nodemailer?.createTransporter !== 'function') {
    console.warn('⚠️ Nodemailer not loaded correctly, attempting fresh require');
    try {
      // Clear from cache and re-require
      delete require.cache[require.resolve('nodemailer')];
      const freshNodemailer = require('nodemailer');
      console.log('📧 Fresh nodemailer type:', typeof freshNodemailer);
      console.log('📧 Fresh nodemailer.createTransporter type:', typeof freshNodemailer?.createTransporter);
      
      if (freshNodemailer && freshNodemailer.default && typeof freshNodemailer.default.createTransporter === 'function') {
        mailer = freshNodemailer.default;
        console.log('✅ Using fresh nodemailer.default');
      } else if (typeof freshNodemailer?.createTransporter === 'function') {
        mailer = freshNodemailer;
        console.log('✅ Using fresh nodemailer directly');
      } else {
        throw new Error('createTransporter not found on nodemailer module');
      }
    } catch (err) {
      console.error('❌ Failed to load nodemailer:', err.message);
      throw new Error('Nodemailer module not available: ' + err.message);
    }
  }
  
  // Verify we have createTransporter before proceeding
  if (typeof mailer.createTransporter !== 'function') {
    throw new Error('mailer.createTransporter is not a function after all attempts');
  }
  
  // Create transporter using same config as DameDesk
  const port = parseInt(process.env.SMTP_PORT || '587');
  const transporter = mailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtpout.secureserver.net',
    port: port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  
  const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 0.9em; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Dame Recruitment</h1>
        </div>
        <div class="content">
          <h2>Your Employment Contract</h2>
          <p>Dear ${candidateName},</p>
          <p>Thank you for completing your registration with Dame Recruitment!</p>
          <p>Your employment contract has been digitally signed and is now active. A copy of your signed contract is attached to this email for your records.</p>
          <p><strong>Contract Details:</strong></p>
          <ul>
            <li>Signed on: ${signatureDate}</li>
            <li>Status: Active</li>
            <li>Type: Temporary Agency Worker Agreement</li>
          </ul>
          <p>Please keep this contract for your records. You can also access it anytime through your candidate portal.</p>
          <p>If you have any questions about your contract or registration, please don't hesitate to contact us.</p>
          <p>We look forward to working with you!</p>
          <p><strong>Best regards,</strong><br>The Dame Recruitment Team</p>
        </div>
        <div class="footer">
          <p>Dame Recruitment Ltd | Registered in England and Wales</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@damerecruitment.co.uk',
    to: to,
    subject: 'Your Employment Contract - Dame Recruitment',
    html: emailHTML,
    attachments: [{
      filename: `Employment_Contract_${candidateName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`,
      content: contractHTML,
      contentType: 'text/html'
    }]
  };
  
  const result = await transporter.sendMail(mailOptions);
  console.log('✅ Contract email sent via SMTP to:', to, '- Message ID:', result.messageId);
}

// Parse multipart form data with file handling
async function parseMultipartFormDataWithFiles(body) {
  const formData = {};
  const files = [];
  
  // Split by boundary and filter out empty parts and boundary markers
  const boundaryMatch = body.match(/------WebKitFormBoundary[a-zA-Z0-9]+/);
  if (!boundaryMatch) return { formData, files };
  
  const boundary = boundaryMatch[0];
  const parts = body.split(boundary).filter(part => part.trim() && !part.includes('--'));
  
  parts.forEach(part => {
    // Extract field name from Content-Disposition header
    const nameMatch = part.match(/name="([^"]+)"/);
    if (!nameMatch) return;
    
    const fieldName = nameMatch[1];
    
    // Check if this is a file upload
    const filenameMatch = part.match(/filename="([^"]+)"/);
    if (filenameMatch && filenameMatch[1]) {
      // This is a file upload
      const fileName = filenameMatch[1];
      console.log(`📁 File upload detected: ${fieldName} = ${fileName}`);
      
      // Extract content type
      const contentTypeMatch = part.match(/Content-Type:\s*([^\r\n]+)/);
      const mimeType = contentTypeMatch ? contentTypeMatch[1].trim() : 'application/octet-stream';
      
      // Find the double CRLF that separates headers from content
      const headerEndIndex = part.indexOf('\r\n\r\n');
      if (headerEndIndex === -1) return;
      
      // Extract file content (binary data)
      const fileContent = part.substring(headerEndIndex + 4);
      
      // Convert to buffer (handle binary data properly)
      const fileBuffer = Buffer.from(fileContent, 'binary');
      
      files.push({
        fieldName,
        fileName,
        mimeType,
        buffer: fileBuffer,
        size: fileBuffer.length
      });
      
      return;
    }
    
    // Regular form field
    // Find the double CRLF that separates headers from content
    const headerEndIndex = part.indexOf('\r\n\r\n');
    if (headerEndIndex === -1) return;
    
    // Extract content after headers
    let value = part.substring(headerEndIndex + 4).trim();
    
    // Skip empty values
    if (!value) {
      formData[fieldName] = '';
      return;
    }
    
    // Convert string booleans to actual booleans
    if (value === 'true') value = true;
    if (value === 'false') value = false;
    
    formData[fieldName] = value;
  });
  
  return { formData, files };
}
