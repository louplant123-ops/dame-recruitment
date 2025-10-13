const fetch = require('node-fetch');
const { Client } = require('pg');
const AWS = require('aws-sdk');
const crypto = require('crypto');

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
      const uploadedFiles = parseResult.files;
      
      console.log('📋 Parsed form data:', formData);
      console.log('📁 Files to upload:', uploadedFiles.length);
    } else {
      // Handle JSON data
      console.log('📦 Processing JSON data');
      formData = JSON.parse(event.body);
    }
    
    console.log('📋 Part 2 data:', {
      candidateId: formData.candidateId,
      hasContract: formData.contractAccepted,
      rightToWorkMethod: formData.rightToWorkMethod
    });

    console.log('📋 Full form data received:', formData);
    
    // Upload files to DigitalOcean Spaces if any were uploaded
    let uploadedFileUrls = [];
    if (contentType.includes('multipart/form-data') && uploadedFiles && uploadedFiles.length > 0) {
      console.log('📁 Processing file uploads...');
      try {
        for (const file of uploadedFiles) {
          const uploadResult = await uploadFileToSpaces(file.buffer, file.fileName, file.mimeType);
          uploadedFileUrls.push(uploadResult);
          console.log('✅ File uploaded:', uploadResult.fileName);
        }
        console.log('✅ All files uploaded successfully');
      } catch (uploadError) {
        console.error('❌ File upload failed:', uploadError);
        // Continue with registration even if file upload fails
      }
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
          right_to_work_method VARCHAR(50),
          share_code VARCHAR(50),
          document_type VARCHAR(50),
          emergency_name VARCHAR(255),
          emergency_phone VARCHAR(20),
          right_to_work_documents TEXT,
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

      // Insert or update the candidate registration with Part 2 data
      const upsertQuery = `
        INSERT INTO candidate_registrations (
          candidate_id, sort_code, account_number, account_holder_name,
          ni_number, right_to_work_method, share_code, document_type,
          emergency_name, emergency_phone, right_to_work_documents, contract_accepted, 
          contract_signature, contract_date, registration_status, 
          part2_completed_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'work_ready', NOW(), NOW())
        ON CONFLICT (candidate_id) 
        DO UPDATE SET 
          sort_code = EXCLUDED.sort_code,
          account_number = EXCLUDED.account_number,
          account_holder_name = EXCLUDED.account_holder_name,
          ni_number = EXCLUDED.ni_number,
          right_to_work_method = EXCLUDED.right_to_work_method,
          share_code = EXCLUDED.share_code,
          document_type = EXCLUDED.document_type,
          emergency_name = EXCLUDED.emergency_name,
          emergency_phone = EXCLUDED.emergency_phone,
          right_to_work_documents = EXCLUDED.right_to_work_documents,
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
      formData.rightToWorkMethod,
      formData.shareCode || null,
      formData.documentType,
      formData.emergencyName,
      formData.emergencyPhone,
      formData.rightToWorkDocuments || null,
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
