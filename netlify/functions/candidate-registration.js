// Netlify Function for Dame Recruitment Website Registration Integration
const { Client } = require('pg');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');

// Parse CV file and extract text
async function parseCVFile(fileBuffer, fileName, mimeType) {
  try {
    console.log('📄 Parsing CV file:', fileName, 'Type:', mimeType);
    
    let cvText = '';
    
    if (mimeType === 'application/pdf') {
      const pdfData = await pdfParse(fileBuffer);
      cvText = pdfData.text;
    } else if (mimeType.includes('wordprocessingml') || mimeType.includes('msword')) {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      cvText = result.value;
    } else if (mimeType === 'text/plain') {
      cvText = fileBuffer.toString('utf-8');
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }
    
    console.log('✅ CV text extracted, length:', cvText.length);
    return cvText;
    
  } catch (error) {
    console.error('❌ CV parsing error:', error);
    throw error;
  }
}

// Extract candidate data from CV text using AI (Claude API)
async function extractCandidateDataFromCV(cvText) {
  try {
    console.log('🤖 Extracting candidate data from CV...');
    
    // For now, return a simple extraction - you can enhance this with Claude API later
    const extractedData = {
      skills: extractSkills(cvText),
      experience: extractExperience(cvText),
      education: extractEducation(cvText),
      name: extractName(cvText),
      email: extractEmail(cvText),
      phone: extractPhone(cvText)
    };
    
    console.log('✅ Candidate data extracted:', extractedData);
    return extractedData;
    
  } catch (error) {
    console.error('❌ Data extraction error:', error);
    return null;
  }
}

// Simple text extraction functions (can be enhanced with AI later)
function extractSkills(text) {
  const skillKeywords = [
    'warehouse', 'forklift', 'picker', 'packer', 'logistics', 'inventory',
    'health and safety', 'manual handling', 'reach truck', 'counterbalance',
    'order picking', 'dispatch', 'goods in', 'goods out', 'stock control'
  ];
  
  const foundSkills = skillKeywords.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );
  
  return foundSkills.join(', ');
}

function extractExperience(text) {
  const experiencePatterns = [
    /(\d+)\s*years?\s*(of\s*)?experience/i,
    /(\d+)\s*years?\s*in\s*warehouse/i,
    /(\d+)\s*years?\s*warehouse/i
  ];
  
  for (const pattern of experiencePatterns) {
    const match = text.match(pattern);
    if (match) {
      return `${match[1]} years`;
    }
  }
  
  return 'Experience level not specified';
}

function extractEducation(text) {
  const educationKeywords = ['gcse', 'a-level', 'degree', 'diploma', 'certificate', 'qualification'];
  const foundEducation = educationKeywords.filter(edu => 
    text.toLowerCase().includes(edu)
  );
  
  return foundEducation.length > 0 ? foundEducation.join(', ') : 'Education not specified';
}

function extractName(text) {
  // Simple name extraction - look for patterns at the beginning
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    if (firstLine.length < 50 && firstLine.split(' ').length <= 4) {
      return firstLine;
    }
  }
  return null;
}

function extractEmail(text) {
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailPattern);
  return matches ? matches[0] : null;
}

function extractPhone(text) {
  const phonePatterns = [
    /(\+44\s?)?(\(0\)\s?)?(\d{4}\s?\d{3}\s?\d{3})/g,
    /(\+44\s?)?(\d{5}\s?\d{6})/g,
    /(\d{3}\s?\d{4}\s?\d{4})/g
  ];
  
  for (const pattern of phonePatterns) {
    const matches = text.match(pattern);
    if (matches) {
      return matches[0].replace(/\s+/g, ' ').trim();
    }
  }
  return null;
}

// Store registration in database
async function storeInDatabase(registrationData) {
  try {
    console.log('🔄 Storing registration in database...');
    
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
    console.log('✅ Connected to database');

    // Create contacts table if it doesn't exist
    const createContactsTableQuery = `
      CREATE TABLE IF NOT EXISTS contacts (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(20),
        mobile VARCHAR(20),
        address TEXT,
        postcode VARCHAR(20),
        date_of_birth DATE,
        gender VARCHAR(20),
        nationality VARCHAR(100),
        type VARCHAR(50) DEFAULT 'candidate',
        status VARCHAR(50) DEFAULT 'active',
        temperature VARCHAR(20) DEFAULT 'warm',
        right_to_work VARCHAR(50),
        transport VARCHAR(50),
        medical_conditions TEXT,
        disability_info TEXT,
        reasonable_adjustments TEXT,
        cv_text TEXT,
        cv_filename VARCHAR(255),
        cv_extracted_data TEXT,
        notes TEXT,
        source VARCHAR(50) DEFAULT 'website_part1',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    await client.query(createContactsTableQuery);
    console.log('✅ Contacts table ready');

    // Insert candidate into contacts table
    const insertQuery = `
      INSERT INTO contacts (
        id, name, email, phone, mobile, address, postcode, 
        gender, nationality, type, status, temperature,
        right_to_work, transport, medical_conditions, disability_info, 
        reasonable_adjustments, cv_text, cv_filename, cv_extracted_data, notes, source, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'candidate', 'active', 'hot', $10, $11, $12, $13, $14, $15, $16, $17, $18, 'website_part1', NOW(), NOW())
      ON CONFLICT (id) 
      DO UPDATE SET 
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        mobile = EXCLUDED.mobile,
        address = EXCLUDED.address,
        postcode = EXCLUDED.postcode,
        gender = EXCLUDED.gender,
        nationality = EXCLUDED.nationality,
        right_to_work = EXCLUDED.right_to_work,
        transport = EXCLUDED.transport,
        medical_conditions = EXCLUDED.medical_conditions,
        disability_info = EXCLUDED.disability_info,
        reasonable_adjustments = EXCLUDED.reasonable_adjustments,
        cv_text = EXCLUDED.cv_text,
        cv_filename = EXCLUDED.cv_filename,
        cv_extracted_data = EXCLUDED.cv_extracted_data,
        notes = EXCLUDED.notes,
        updated_at = NOW()
      RETURNING id, name
    `;

    const values = [
      registrationData.id,
      `${registrationData.firstName} ${registrationData.lastName}`,
      registrationData.email,
      registrationData.phone,
      registrationData.mobile, // Same as phone
      registrationData.address,
      registrationData.postcode,
      registrationData.gender,
      registrationData.nationality,
      registrationData.rightToWork,
      registrationData.transport,
      registrationData.medicalConditions,
      registrationData.disabilityInfo,
      registrationData.reasonableAdjustments,
      registrationData.cvText,
      registrationData.cvFileName,
      registrationData.cvExtractedData ? JSON.stringify(registrationData.cvExtractedData) : null,
      `Part 1 registration: ${registrationData.experience} experience, ${registrationData.jobTypes?.join(', ')} roles`
    ];

    const result = await client.query(insertQuery, values);
    await client.end();
    
    console.log('✅ Registration stored in database:', result.rows[0]);
    
  } catch (error) {
    console.error('❌ Database storage error:', error);
    // Don't throw - continue with webhook even if DB fails
  }
}

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': 'https://www.damerecruitment.co.uk',
        'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://www.damerecruitment.co.uk',
        'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    console.log('🌉 Netlify Function: Received registration from website');
    console.log('📥 Raw event body:', event.body);
    console.log('📋 Event headers:', event.headers);
    
    // Parse the request body - handle both JSON and multipart/form-data
    let body;
    const contentType = event.headers['content-type'] || '';
    
    if (contentType.includes('multipart/form-data')) {
      console.log('📦 Processing multipart/form-data');
      // For multipart data, we need to parse it differently
      // Netlify automatically parses multipart data, but we need to handle it
      const formData = event.body;
      
      // Decode base64 if needed
      let decodedBody;
      try {
        decodedBody = Buffer.from(formData, 'base64').toString('utf-8');
        console.log('📝 Decoded multipart body:', decodedBody);
      } catch (decodeError) {
        console.error('❌ Base64 decode error:', decodeError);
        throw new Error('Failed to decode multipart data');
      }
      
      // Parse multipart form data with file handling
      const parseResult = await parseMultipartFormDataWithFiles(decodedBody);
      body = parseResult.formData;
      const uploadedFiles = parseResult.files;
      
      console.log('✅ Successfully parsed multipart body:', body);
      console.log('📁 Files uploaded:', uploadedFiles.length);
    console.log('🔍 Sample field values:');
    console.log('  firstName:', body.firstName);
    console.log('  email:', body.email);
    console.log('  jobTypes:', body.jobTypes);
    } else {
      // Handle JSON data
      try {
        body = JSON.parse(event.body);
        console.log('✅ Successfully parsed JSON body:', body);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        throw new Error('Invalid JSON in request body');
      }
    }

    // Process CV file if uploaded
    let cvData = null;
    if (contentType.includes('multipart/form-data') && uploadedFiles && uploadedFiles.length > 0) {
      console.log('📄 Processing CV files...');
      
      // Find CV file (look for 'cv' field name)
      const cvFile = uploadedFiles.find(file => file.fieldName === 'cv');
      if (cvFile) {
        try {
          console.log('📄 Found CV file:', cvFile.fileName);
          
          // Parse CV and extract data
          const cvText = await parseCVFile(cvFile.buffer, cvFile.fileName, cvFile.mimeType);
          cvData = await extractCandidateDataFromCV(cvText);
          
          console.log('✅ CV data extracted:', cvData);
          
          // Store CV text for later use
          body.cvText = cvText;
          body.cvFileName = cvFile.fileName;
          
        } catch (cvError) {
          console.error('❌ CV processing error:', cvError);
          // Continue with registration even if CV parsing fails
        }
      }
    }

    // Create registration data
    const registrationData = {
      id: `REG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      mobile: body.phone, // Map single phone field to both phone and mobile
      dateOfBirth: body.dateOfBirth,
      address: body.address,
      postcode: body.postcode,
      gender: body.gender,
      nationality: body.nationality,
      medicalConditions: body.medicalConditions,
      disabilityInfo: body.disabilityInfo,
      reasonableAdjustments: body.reasonableAdjustments,
      rightToWork: body.rightToWork,
      visaType: body.visaType,
      visaExpiry: body.visaExpiry,
      jobTypes: body.jobTypes,
      industries: body.industries,
      experience: body.experience,
      shifts: body.shifts,
      availability: body.availability,
      transport: body.transport,
      drivingLicense: body.drivingLicense === 'true',
      ownVehicle: body.ownVehicle === 'true',
      fltLicense: body.fltLicense === 'true',
      fltTypes: body.fltTypes,
      otherLicenses: body.otherLicenses,
      registrationType: body.registrationType || 'temp',
      source: 'netlify_function',
      processed: false,
      // CV-related fields
      cvText: body.cvText || null,
      cvFileName: body.cvFileName || null,
      cvExtractedData: cvData || null
    };

    console.log('📤 About to forward to DameDesk:', registrationData);
    
    // Store in database first
    await storeInDatabase(registrationData);
    
    // Forward to your local DameDesk via webhook
    await forwardToDameDesk(registrationData);
    
    console.log('✅ Netlify Function: Registration processed successfully');
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://www.damerecruitment.co.uk',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'Registration received and queued for processing',
        registrationId: registrationData.id
      })
    };
    
  } catch (error) {
    console.error('❌ Netlify Function: Error processing registration:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': 'https://www.damerecruitment.co.uk',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: 'Registration processing failed'
      })
    };
  }
};

// Parse multipart form data
function parseMultipartFormData(body) {
  const data = {};
  
  // Split by boundary and filter out empty parts and boundary markers
  const boundaryMatch = body.match(/------WebKitFormBoundary[a-zA-Z0-9]+/);
  if (!boundaryMatch) return data;
  
  const boundary = boundaryMatch[0];
  const parts = body.split(boundary).filter(part => part.trim() && !part.includes('--'));
  
  parts.forEach(part => {
    // Extract field name from Content-Disposition header
    const nameMatch = part.match(/name="([^"]+)"/);
    if (!nameMatch) return;
    
    const fieldName = nameMatch[1];
    
    // Find the double CRLF that separates headers from content
    const headerEndIndex = part.indexOf('\r\n\r\n');
    if (headerEndIndex === -1) return;
    
    // Extract content after headers
    let value = part.substring(headerEndIndex + 4).trim();
    
    // Skip empty values
    if (!value) {
      data[fieldName] = '';
      return;
    }
    
    // Parse JSON strings for arrays
    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        value = JSON.parse(value);
      } catch (e) {
        // Keep as string if JSON parse fails
      }
    }
    
    // Convert string booleans to actual booleans
    if (value === 'true') value = true;
    if (value === 'false') value = false;
    
    data[fieldName] = value;
  });
  
  return data;
}

// Forward registration to your local DameDesk
async function forwardToDameDesk(registrationData) {
  // Option 1: Use ngrok to expose your local DameDesk
  const DAMEDESK_WEBHOOK_URL = process.env.DAMEDESK_WEBHOOK_URL;
  
  console.log('🔗 DAMEDESK_WEBHOOK_URL:', DAMEDESK_WEBHOOK_URL);
  console.log('🕐 Environment check timestamp:', new Date().toISOString());
  
  if (DAMEDESK_WEBHOOK_URL) {
    try {
      console.log('📡 Attempting to forward to DameDesk...');
      const response = await fetch(DAMEDESK_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'netlify-function-key'
        },
        body: JSON.stringify(registrationData)
      });
      
      console.log('📊 DameDesk response status:', response.status);
      console.log('📊 DameDesk response headers:', response.headers);
      
      if (response.ok) {
        const responseText = await response.text();
        console.log('✅ Successfully forwarded to DameDesk, response:', responseText);
        return;
      } else {
        const errorText = await response.text();
        console.error('❌ DameDesk responded with error:', response.status, errorText);
        throw new Error(`DameDesk error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('⚠️ Failed to forward to DameDesk:', error.message);
      throw error; // Re-throw to trigger the main catch block
    }
  } else {
    console.warn('⚠️ No DAMEDESK_WEBHOOK_URL configured');
    throw new Error('DAMEDESK_WEBHOOK_URL not configured');
  }
}

// Fallback: Send email notification
async function sendEmailNotification(registrationData) {
  // You can integrate with services like:
  // - SendGrid
  // - Mailgun  
  // - Netlify Forms
  // - Zapier webhook
  
  console.log('📧 Would send email notification for registration:', registrationData.id);
  
  // Example: Post to Zapier webhook
  const ZAPIER_WEBHOOK = process.env.ZAPIER_WEBHOOK_URL;
  if (ZAPIER_WEBHOOK) {
    try {
      await fetch(ZAPIER_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      });
    } catch (error) {
      console.warn('Zapier webhook failed:', error.message);
    }
  }
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
