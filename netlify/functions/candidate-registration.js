// Netlify Function for Dame Recruitment Website Registration Integration
const { Client } = require('pg');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const PDFDocument = require('pdfkit');

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

// Generate PDF from registration data
async function generateRegistrationPDF(registrationData) {
  return new Promise((resolve, reject) => {
    try {
      console.log('📄 Generating registration PDF...');
      
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];
      
      // Collect PDF data
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        console.log('✅ PDF generated, size:', pdfBuffer.length);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);
      
      // Header
      doc.fontSize(20).fillColor('#DC2626').text('Dame Recruitment', { align: 'center' });
      doc.fontSize(16).fillColor('#1F2937').text('Candidate Registration Form', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).fillColor('#6B7280').text(`Registration ID: ${registrationData.id}`, { align: 'center' });
      doc.text(`Date: ${new Date(registrationData.timestamp).toLocaleDateString('en-GB')}`, { align: 'center' });
      doc.moveDown(2);
      
      // Personal Details Section
      doc.fontSize(14).fillColor('#DC2626').text('Personal Details');
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#E5E7EB');
      doc.moveDown(0.5);
      
      doc.fontSize(10).fillColor('#1F2937');
      doc.text(`Name: ${registrationData.firstName} ${registrationData.lastName}`);
      doc.text(`Email: ${registrationData.email}`);
      doc.text(`Phone: ${registrationData.phone}`);
      if (registrationData.dateOfBirth) doc.text(`Date of Birth: ${registrationData.dateOfBirth}`);
      doc.text(`Address: ${registrationData.address}`);
      doc.text(`Postcode: ${registrationData.postcode}`);
      if (registrationData.gender) doc.text(`Gender: ${registrationData.gender}`);
      if (registrationData.nationality) doc.text(`Nationality: ${registrationData.nationality}`);
      doc.moveDown(1.5);
      
      // Right to Work Section
      doc.fontSize(14).fillColor('#DC2626').text('Right to Work');
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#E5E7EB');
      doc.moveDown(0.5);
      
      doc.fontSize(10).fillColor('#1F2937');
      doc.text(`Status: ${registrationData.rightToWork || 'Not specified'}`);
      if (registrationData.visaType) doc.text(`Visa Type: ${registrationData.visaType}`);
      if (registrationData.visaExpiry) doc.text(`Visa Expiry: ${registrationData.visaExpiry}`);
      doc.moveDown(1.5);
      
      // Role Interests Section
      doc.fontSize(14).fillColor('#DC2626').text('Role Interests');
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#E5E7EB');
      doc.moveDown(0.5);
      
      doc.fontSize(10).fillColor('#1F2937');
      if (registrationData.jobTypes) {
        const jobTypes = Array.isArray(registrationData.jobTypes) 
          ? registrationData.jobTypes.join(', ') 
          : registrationData.jobTypes;
        doc.text(`Job Types: ${jobTypes}`);
      }
      if (registrationData.industries) {
        const industries = Array.isArray(registrationData.industries) 
          ? registrationData.industries.join(', ') 
          : registrationData.industries;
        doc.text(`Industries: ${industries}`);
      }
      if (registrationData.yearsOfExperience) doc.text(`Years of Experience: ${registrationData.yearsOfExperience}`);
      if (registrationData.expectedHourlyRate) doc.text(`Expected Hourly Rate: £${registrationData.expectedHourlyRate}/hour`);
      if (registrationData.experience) {
        doc.text('Experience Summary:', { continued: false });
        doc.fontSize(9).fillColor('#6B7280').text(registrationData.experience, { width: 500 });
        doc.fontSize(10).fillColor('#1F2937');
      }
      doc.moveDown(1.5);
      
      // Availability Section
      doc.fontSize(14).fillColor('#DC2626').text('Availability & Shifts');
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#E5E7EB');
      doc.moveDown(0.5);
      
      doc.fontSize(10).fillColor('#1F2937');
      if (registrationData.shifts) {
        const shifts = Array.isArray(registrationData.shifts) 
          ? registrationData.shifts.join(', ') 
          : registrationData.shifts;
        doc.text(`Shift Preferences: ${shifts}`);
      }
      if (registrationData.availability) doc.text(`Available From: ${registrationData.availability}`);
      doc.moveDown(1.5);
      
      // Transport Section
      doc.fontSize(14).fillColor('#DC2626').text('Transport');
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#E5E7EB');
      doc.moveDown(0.5);
      
      doc.fontSize(10).fillColor('#1F2937');
      doc.text(`Transport Method: ${registrationData.transport || 'Not specified'}`);
      if (registrationData.maxTravelDistance) doc.text(`Maximum Travel Distance: ${registrationData.maxTravelDistance} miles`);
      doc.text(`Driving License: ${registrationData.drivingLicense ? 'Yes' : 'No'}`);
      doc.text(`Own Vehicle: ${registrationData.ownVehicle ? 'Yes' : 'No'}`);
      doc.moveDown(1.5);
      
      // Licenses Section
      doc.fontSize(14).fillColor('#DC2626').text('Licenses & Certifications');
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#E5E7EB');
      doc.moveDown(0.5);
      
      doc.fontSize(10).fillColor('#1F2937');
      doc.text(`FLT License: ${registrationData.fltLicense ? 'Yes' : 'No'}`);
      if (registrationData.fltLicense && registrationData.fltTypes) {
        const fltTypes = Array.isArray(registrationData.fltTypes) 
          ? registrationData.fltTypes.join(', ') 
          : registrationData.fltTypes;
        doc.text(`FLT Types: ${fltTypes}`);
      }
      if (registrationData.otherLicenses) doc.text(`Other Licenses: ${registrationData.otherLicenses}`);
      doc.moveDown(1.5);
      
      // Medical Information Section (if provided)
      if (registrationData.medicalConditions || registrationData.disabilityInfo || registrationData.reasonableAdjustments) {
        doc.fontSize(14).fillColor('#DC2626').text('Medical & Disability Information');
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#E5E7EB');
        doc.moveDown(0.5);
        
        doc.fontSize(10).fillColor('#1F2937');
        if (registrationData.medicalConditions) doc.text(`Medical Conditions: ${registrationData.medicalConditions}`);
        if (registrationData.disabilityInfo) doc.text(`Disability Info: ${registrationData.disabilityInfo}`);
        if (registrationData.reasonableAdjustments) doc.text(`Reasonable Adjustments: ${registrationData.reasonableAdjustments}`);
        doc.moveDown(1.5);
      }
      
      // CV Information
      if (registrationData.cvFileName) {
        doc.fontSize(14).fillColor('#DC2626').text('CV Information');
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#E5E7EB');
        doc.moveDown(0.5);
        
        doc.fontSize(10).fillColor('#1F2937');
        doc.text(`CV File: ${registrationData.cvFileName}`);
        doc.moveDown(1.5);
      }
      
      // Footer
      doc.fontSize(8).fillColor('#9CA3AF');
      doc.text('This document was automatically generated by Dame Recruitment CRM system.', 50, doc.page.height - 50, {
        align: 'center',
        width: 500
      });
      
      doc.end();
      
    } catch (error) {
      console.error('❌ PDF generation error:', error);
      reject(error);
    }
  });
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
        registration_pdf BYTEA,
        registration_pdf_filename VARCHAR(255),
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
        date_of_birth, gender, nationality, type, status, temperature,
        right_to_work, transport_method, medical_conditions, disability_info,
        reasonable_adjustments, cv_text, cv_filename, cv_extracted_data,
        registration_pdf, registration_pdf_filename, notes, source,
        skills, years_of_experience, preferred_job_types, hourly_rate,
        availability_status, available_from,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, 'candidate', 'active', 'hot',
        $11, $12, $13, $14,
        $15, $16, $17, $18,
        $19, $20, $21, 'website_part1',
        $22, $23, $24, $25,
        $26, $27,
        NOW(), NOW()
      )
      ON CONFLICT (id)
      DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        mobile = EXCLUDED.mobile,
        address = EXCLUDED.address,
        postcode = EXCLUDED.postcode,
        date_of_birth = EXCLUDED.date_of_birth,
        gender = EXCLUDED.gender,
        nationality = EXCLUDED.nationality,
        right_to_work = EXCLUDED.right_to_work,

        medical_conditions = EXCLUDED.medical_conditions,
        disability_info = EXCLUDED.disability_info,
        reasonable_adjustments = EXCLUDED.reasonable_adjustments,
        cv_text = EXCLUDED.cv_text,
        cv_filename = EXCLUDED.cv_filename,
        cv_extracted_data = EXCLUDED.cv_extracted_data,
        registration_pdf = EXCLUDED.registration_pdf,
        registration_pdf_filename = EXCLUDED.registration_pdf_filename,
        notes = EXCLUDED.notes,
        skills = EXCLUDED.skills,
        years_of_experience = EXCLUDED.years_of_experience,
        preferred_job_types = EXCLUDED.preferred_job_types,
        hourly_rate = EXCLUDED.hourly_rate,
        availability_status = EXCLUDED.availability_status,
        available_from = EXCLUDED.available_from,
        transport_method = EXCLUDED.transport_method,
        updated_at = NOW()
      RETURNING id, name
    `;

        const summaryParts = [];

    // Normalise jobTypes and industries so they can be arrays or single values
    const jobTypesArray = Array.isArray(registrationData.jobTypes)
      ? registrationData.jobTypes
      : registrationData.jobTypes
        ? [registrationData.jobTypes]
        : [];

    const industriesArray = Array.isArray(registrationData.industries)
      ? registrationData.industries
      : registrationData.industries
        ? [registrationData.industries]
        : [];

    const shiftsArray = Array.isArray(registrationData.shifts)
      ? registrationData.shifts
      : registrationData.shifts
        ? [registrationData.shifts]
        : [];

    if (registrationData.experience) summaryParts.push(`Experience: ${registrationData.experience}`);
    if (jobTypesArray.length)
      summaryParts.push(`Job types: ${jobTypesArray.join(', ')}`);
    if (industriesArray.length)
      summaryParts.push(`Industries: ${industriesArray.join(', ')}`);
    if (registrationData.transport) summaryParts.push(`Transport: ${registrationData.transport}`);
    if (shiftsArray.length)
      summaryParts.push(`Shifts: ${shiftsArray.join(', ')}`);
    if (registrationData.availability) summaryParts.push(`Availability: ${registrationData.availability}`);

    const notesSummary = summaryParts.length
      ? `Part 1 registration – ${summaryParts.join(' | ')}`
      : 'Part 1 registration';

    const skillsFromForm =
      (industriesArray.length
        ? industriesArray.join(', ')
        : null) || registrationData.experience || null;

    const preferredJobTypes = jobTypesArray.length
      ? jobTypesArray.join(', ')
      : null;

    // Normalise yearsOfExperience so the DB INTEGER column doesn't receive ranges like "1-2"
    let yearsOfExperienceValue = null;
    if (registrationData.yearsOfExperience !== undefined && registrationData.yearsOfExperience !== null && registrationData.yearsOfExperience !== '') {
      if (typeof registrationData.yearsOfExperience === 'number') {
        yearsOfExperienceValue = registrationData.yearsOfExperience;
      } else if (typeof registrationData.yearsOfExperience === 'string') {
        // Handle ranges like "1-2" by taking the first number
        const rangeMatch = registrationData.yearsOfExperience.match(/(\d+)/);
        if (rangeMatch) {
          yearsOfExperienceValue = parseInt(rangeMatch[1], 10);
        } else {
          const parsed = parseInt(registrationData.yearsOfExperience, 10);
          yearsOfExperienceValue = Number.isNaN(parsed) ? null : parsed;
        }
      }
    }

    const values = [
      registrationData.id,
      `${registrationData.firstName} ${registrationData.lastName}`,
      registrationData.email,
      registrationData.phone,
      registrationData.mobile, // Same as phone
      registrationData.address,
      registrationData.postcode,
      registrationData.dateOfBirth || null,
      registrationData.gender,
      registrationData.nationality,
      registrationData.rightToWork,
      registrationData.transport_method,
      registrationData.medicalConditions,
      registrationData.disabilityInfo,
      registrationData.reasonableAdjustments,
      registrationData.cvText,
      registrationData.cvFileName,
      registrationData.cvExtractedData ? JSON.stringify(registrationData.cvExtractedData) : null,
      registrationData.registrationPDF || null,
      registrationData.registrationPDFFilename || null,
      notesSummary,
      skillsFromForm,
      yearsOfExperienceValue,
      preferredJobTypes,
      registrationData.expectedHourlyRate || null,
      'active',
      registrationData.availability || null
    ];

    const result = await client.query(insertQuery, values);

    // 🔹 Log unified Activity in DameDesk CRM for website registration
    try {
      const candidateId = result.rows[0]?.id;

      if (candidateId) {
        await client.query(
          `INSERT INTO activities (
             subject_type,
             subject_id,
             type,
             summary,
             details,
             channel,
             direction,
             user_name
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            'candidate',                         // subject_type
            candidateId,                         // subject_id from contacts.id
            'registration',                      // type
            'Registered via website (Part 1)',   // summary
            JSON.stringify({
              source: 'website_candidate_registration',
              formVersion: 'part1',
              email: registrationData.email,
              name: `${registrationData.firstName} ${registrationData.lastName}`
            }),
            'web',                               // channel
            'inbound',                           // direction
            'website'                            // user_name / system actor
          ]
        );
        console.log('✅ Activity logged for website registration:', candidateId);
      } else {
        console.warn('⚠️ No candidateId returned from contacts insert, skipping Activity log');
      }
    } catch (activityError) {
      console.error('⚠️ Failed to log registration activity:', activityError);
      // Do not throw - we don't want to break registration if Activity logging fails
    }

    await client.end();
    
    console.log('✅ Registration stored in database:', result.rows[0]);
    
  } catch (error) {
    console.error('❌ Database storage error:', error);
    // Don't throw - continue with webhook even if DB fails
  }
}

exports.handler = async (event, context) => {
  console.log('🌟 candidate-registration handler VERSION: multipart-scope-fix-1');

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
    let cvData = null;
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

      // Process CV file if uploaded (keep inside this block so uploadedFiles is in scope)
      if (uploadedFiles && uploadedFiles.length > 0) {
        console.log('📄 Processing CV files...');
        const cvFile = uploadedFiles.find(file => file.fieldName === 'cv');
        if (cvFile) {
          try {
            console.log('📄 Found CV file:', cvFile.fileName);
            const cvText = await parseCVFile(cvFile.buffer, cvFile.fileName, cvFile.mimeType);
            cvData = await extractCandidateDataFromCV(cvText);
            console.log('✅ CV data extracted:', cvData);
            body.cvText = cvText;
            body.cvFileName = cvFile.fileName;
          } catch (cvError) {
            console.error('❌ CV processing error:', cvError);
            // Continue with registration even if CV parsing fails
          }
        }
      }
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
      yearsOfExperience: body.yearsOfExperience, // NEW
      expectedHourlyRate: body.expectedHourlyRate ? parseFloat(body.expectedHourlyRate) : null, // NEW
      shifts: body.shifts,
      availability: body.availability,
      transport: body.transport,
      maxTravelDistance: body.maxTravelDistance ? parseInt(body.maxTravelDistance) : 10, // NEW
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
    
    // Generate registration PDF
    let registrationPDF = null;
    try {
      registrationPDF = await generateRegistrationPDF(registrationData);
      registrationData.registrationPDF = registrationPDF;
      registrationData.registrationPDFFilename = `Registration_${registrationData.firstName}_${registrationData.lastName}_${Date.now()}.pdf`;
      console.log('✅ Registration PDF generated:', registrationData.registrationPDFFilename);
    } catch (pdfError) {
      console.error('⚠️ PDF generation failed, continuing without PDF:', pdfError);
    }
    
    // Store in database first
    await storeInDatabase(registrationData);
    
    // Forward to your local DameDesk via webhook (best-effort)
    try {
      await forwardToDameDesk(registrationData);
    } catch (forwardError) {
      console.error('⚠️ Forwarding to DameDesk failed, but registration stored:', forwardError);
      // Do not throw - we still want to return 200 to the website
    }

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
