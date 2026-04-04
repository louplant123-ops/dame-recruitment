// Netlify Function for Dame Recruitment Website Registration Integration
const https = require('https');
const http = require('http');
const crypto = require('crypto');

exports.handler = async (event, context) => {
  // Handle CORS preflight (must come before method check)
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

  try {
    console.log('🌉 Netlify Function: Received registration from website');
    
    // Parse FormData from the request
    const contentType = event.headers['content-type'] || '';
    let body = {};
    let uploadedFiles = [];
    
    if (contentType.includes('multipart/form-data')) {
      console.log('📦 Processing multipart/form-data with file uploads');
      
      // Use busboy to parse multipart form data with files
      const busboy = require('busboy');
      const parseResult = await new Promise((resolve, reject) => {
        const fields = {};
        const files = [];
        
        const bb = busboy({ headers: event.headers });
        
        // Handle form fields
        bb.on('field', (fieldname, val) => {
          fields[fieldname] = val;
        });
        
        // Handle file uploads
        bb.on('file', (fieldname, file, info) => {
          const { filename, encoding, mimeType } = info;
          console.log(`📁 File upload detected: ${fieldname} = ${filename} (${mimeType})`);
          
          const chunks = [];
          file.on('data', (data) => {
            chunks.push(data);
          });
          
          file.on('end', () => {
            const fileBuffer = Buffer.concat(chunks);
            files.push({
              fieldName: fieldname,
              fileName: filename,
              mimeType: mimeType,
              buffer: fileBuffer,
              size: fileBuffer.length
            });
            console.log(`✅ File buffered: ${filename} (${fileBuffer.length} bytes)`);
          });
        });
        
        bb.on('finish', () => {
          resolve({ formData: fields, files });
        });
        
        bb.on('error', reject);
        
        // Write the body to busboy
        bb.end(Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8'));
      });
      
      body = parseResult.formData;
      uploadedFiles = parseResult.files || [];
      
      console.log('📋 Parsed FormData fields:', Object.keys(body));
      console.log('� FormData values:', JSON.stringify(body, null, 2));
      console.log('�📁 Files detected:', uploadedFiles.length);
      if (uploadedFiles.length > 0) {
        uploadedFiles.forEach(f => console.log(`   - ${f.fieldName}: ${f.fileName} (${f.size} bytes)`));
      }
    } else {
      // Fallback to JSON parsing
      body = JSON.parse(event.body);
    }
    
    // Get candidate ID from query parameters (if updating existing candidate)
    const candidateId = event.queryStringParameters?.id || body.candidateId;
    
    // Create registration data with ALL fields
    const registrationData = {
      candidateId: candidateId, // The actual candidate ID to update
      isUpdate: !!candidateId, // Flag to indicate this is updating an existing candidate
      timestamp: new Date().toISOString(),
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      dateOfBirth: body.dateOfBirth,
      address: body.address,
      postcode: body.postcode,
      gender: body.gender,
      nationality: body.nationality,
      rightToWork: body.rightToWork,
      visaType: body.visaType,
      visaExpiry: body.visaExpiry,
      jobTypes: body.jobTypes,
      industries: body.industries,
      experience: body.experience,
      yearsOfExperience: body.yearsOfExperience || body.years_of_experience,
      expectedHourlyRate: body.expectedHourlyRate || body.expected_hourly_rate,
      shifts: body.shifts,
      availability: body.availability || body.start_availability || body.whenCanYouStart,
      transport: body.transport,
      maxTravelDistance: body.maxTravelDistance,
      fltLicense: body.fltLicense === 'true',
      fltTypes: body.fltTypes,
      otherLicenses: body.otherLicenses,
      medicalConditions: body.medicalConditions,
      disabilityInfo: body.disabilityInfo,
      reasonableAdjustments: body.reasonableAdjustments,
      currentlyEmployed: body.currentlyEmployed === 'true',
      currentEmployer: body.currentEmployer,
      currentPosition: body.currentPosition,
      currentStartDate: body.currentStartDate,
      employmentHistory: body.employmentHistory,
      registrationType: body.registrationType || 'temp',
      source: body.source || 'website_registration',
      processed: false
    };
    
    console.log(candidateId ? `📝 Updating existing candidate: ${candidateId}` : '✨ Creating new candidate registration');
    console.log('📋 Registration Data Fields:', {
      availability: registrationData.availability,
      jobTypes: registrationData.jobTypes,
      yearsOfExperience: registrationData.yearsOfExperience,
      experience: registrationData.experience,
      expectedHourlyRate: registrationData.expectedHourlyRate,
      shifts: registrationData.shifts,
      transport: registrationData.transport
    });

    // Process CV file if provided (store as base64 in database - NO cloud storage needed)
    let cvFileData = null;
    if (uploadedFiles && uploadedFiles.length > 0) {
      console.log('📁 Processing CV file...');
      const cvFile = uploadedFiles.find(f => f.fieldName === 'cv');
      if (cvFile) {
        cvFileData = {
          fileName: cvFile.fileName,
          mimeType: cvFile.mimeType,
          size: cvFile.size,
          content: cvFile.buffer.toString('base64'), // Store as base64 in database
          uploadedAt: new Date().toISOString()
        };
        console.log('✅ CV file prepared:', cvFile.fileName, `(${cvFile.size} bytes)`);
        
        // Parse CV to extract text
        try {
          console.log('🔄 Starting CV text extraction...');
          const parsedCV = await parseCVFile(cvFile.buffer, cvFile.mimeType, cvFile.fileName);
          console.log('📊 Parsing result:', { hasText: !!parsedCV.text, wordCount: parsedCV.wordCount });
          
          if (parsedCV.text) {
            cvFileData.extractedText = parsedCV.text;
            cvFileData.wordCount = parsedCV.wordCount;
            console.log('✅ CV text extracted:', parsedCV.wordCount, 'words');
            console.log('📄 CV Preview (first 200 chars):', parsedCV.text.substring(0, 200) + '...');
            
            // Use AI to extract structured data from CV text
            if (process.env.OPENAI_API_KEY) {
              try {
                console.log('🤖 Starting AI extraction...');
                const aiData = await parseWithAI(parsedCV.text);
                cvFileData.aiExtractedData = aiData;
                console.log('✅ AI extraction successful');
                console.log('📊 Extracted data:', {
                  name: aiData.name,
                  email: aiData.email,
                  phone: aiData.phone,
                  skills: aiData.skills?.substring(0, 50) + '...',
                  experience_level: aiData.experience_level,
                  years_of_experience: aiData.years_of_experience
                });
              } catch (aiError) {
                console.error('⚠️ AI extraction failed:', aiError.message);
                // Continue without AI data - text extraction still worked
              }
            } else {
              console.warn('⚠️ OPENAI_API_KEY not set - skipping AI extraction');
            }
          } else {
            console.warn('⚠️ No text extracted from CV');
          }
        } catch (parseError) {
          console.error('❌ CV parsing failed:', parseError);
          console.error('Error details:', parseError.message, parseError.stack);
          // Continue anyway - file is still saved
        }
      }
    }

    // Forward to your local DameDesk via webhook
    await forwardToDameDesk(registrationData, cvFileData, candidateId || `CAND_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    
    console.log('✅ Netlify Function: Registration processed successfully');
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://www.damerecruitment.co.uk',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: candidateId ? 'Registration updated successfully' : 'Registration received and queued for processing',
        candidateId: candidateId,
        isUpdate: !!candidateId
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

// Save registration directly to database
async function forwardToDameDesk(registrationData, cvFileData, candidateId) {
  const { Client } = require('pg');
  
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 25060,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'defaultdb',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('📊 Connected to database');
    
    const isUpdate = registrationData.isUpdate && candidateId;
    
    console.log(`🎯 Will ${isUpdate ? 'UPDATE' : 'CREATE'} candidate with ID: ${candidateId}`);
    
    if (isUpdate) {
      // Update existing candidate in contacts table with ALL Part 1 fields
      const updateQuery = `
        UPDATE contacts SET
          name = $1,
          email = $2,
          phone = $3,
          date_of_birth = $4,
          address = $5,
          postcode = $6,
          location = $7,
          gender = $8,
          nationality = $9,
          right_to_work = $10,
          visa_type = $11,
          visa_expiry = $12,
          industries = $13,
          availability = $14,
          shifts = $15,
          transport = $16,
          max_travel_distance = $17,
          experience_summary = $18,
          years_of_experience = $19,
          experience_level = $20,
          hourly_rate = $21,
          preferred_job_types = $22,
          flt_license = $23,
          flt_types = $24,
          other_licenses = $25,
          medical_conditions = $26,
          disability_info = $27,
          reasonable_adjustments = $28,
          driving_license = $29,
          skills = $30,
          employment_history = $31,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $32 AND type = 'candidate'
        RETURNING id
      `;
      
      // Merge AI-extracted data with form data (form data takes priority)
      const aiData = cvFileData?.aiExtractedData || {};
      
      // Convert years_of_experience string to number (e.g., "2-5" -> 3) and calculate experience_level
      let yearsExp = null;
      let experienceLevel = null;
      const yearsStr = registrationData.yearsOfExperience || aiData.years_of_experience;
      
      if (yearsStr) {
        if (yearsStr === '0-1') {
          yearsExp = 0;
          experienceLevel = 'entry';
        } else if (yearsStr === '1-2') {
          yearsExp = 1;
          experienceLevel = 'entry';
        } else if (yearsStr === '2-5' || yearsStr === '0-2' || yearsStr === '3-5') {
          yearsExp = 3;
          experienceLevel = 'mid';
        } else if (yearsStr === '5-10' || yearsStr === '6-10') {
          yearsExp = 7;
          experienceLevel = 'senior';
        } else if (yearsStr === '10+') {
          yearsExp = 12;
          experienceLevel = 'lead';
        } else {
          yearsExp = parseInt(yearsStr) || null;
          // Calculate experience level from numeric value
          if (yearsExp !== null) {
            if (yearsExp < 2) experienceLevel = 'entry';
            else if (yearsExp < 5) experienceLevel = 'mid';
            else if (yearsExp < 10) experienceLevel = 'senior';
            else experienceLevel = 'lead';
          }
        }
      }
      
      // Merge employment history from form and AI (UPDATE path)
      let employmentHistoryUpdate = registrationData.employmentHistory || aiData.employmentHistory || null;
      if (typeof employmentHistoryUpdate === 'string') {
        try {
          employmentHistoryUpdate = JSON.parse(employmentHistoryUpdate);
        } catch (e) {
          console.warn('Could not parse employment history:', e);
          employmentHistoryUpdate = null;
        }
      }
      
      const result = await client.query(updateQuery, [
        `${registrationData.firstName} ${registrationData.lastName}`,
        registrationData.email || aiData.email,
        registrationData.phone || aiData.phone,
        registrationData.dateOfBirth || null,
        registrationData.address || aiData.location,
        registrationData.postcode || aiData.postcode,
        `${registrationData.address || aiData.location}, ${registrationData.postcode || aiData.postcode}`,
        registrationData.gender,
        registrationData.nationality,
        registrationData.rightToWork,
        registrationData.visaType || null,
        registrationData.visaExpiry || null,
        registrationData.industries || aiData.industries || null,
        registrationData.availability || null,
        registrationData.shifts || aiData.shifts?.join(', ') || null,
        registrationData.transport || null,
        registrationData.maxTravelDistance || null,
        registrationData.experience || aiData.experience || null,
        yearsExp,
        experienceLevel,
        registrationData.expectedHourlyRate || null,
        registrationData.jobTypes || aiData.job_types || null,
        registrationData.fltLicense || false,
        registrationData.fltTypes || null,
        registrationData.otherLicenses || null,
        registrationData.medicalConditions || null,
        registrationData.disabilityInfo || null,
        registrationData.reasonableAdjustments || null,
        registrationData.drivingLicense || null,
        aiData.skills || null,
        employmentHistoryUpdate ? JSON.stringify(employmentHistoryUpdate) : null,
        candidateId
      ]);
      
      // Save CV document if uploaded (UPDATE path)
      if (result.rowCount > 0 && cvFileData) {
        try {
          const docId = `DOC_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
          
          // Build notes with parsing info
          let notes = 'CV uploaded via Part 1 registration (update)';
          if (cvFileData.extractedText) {
            notes += ` | Parsed: ${cvFileData.wordCount} words extracted`;
          }
          
          // Check if CV already exists for this candidate
          const existingCV = await client.query(
            'SELECT id FROM candidate_documents WHERE contact_id = $1 AND type = $2',
            [candidateId, 'cv']
          );
          
          if (existingCV.rows.length > 0) {
            // Update existing CV
            await client.query(`
              UPDATE candidate_documents 
              SET name = $1, content = $2, file_size = $3, uploaded_date = NOW(), notes = $4
              WHERE contact_id = $5 AND type = 'cv'
            `, [
              cvFileData.fileName,
              cvFileData.content,
              cvFileData.size,
              notes,
              candidateId
            ]);
            console.log('✅ CV document updated in database:', cvFileData.fileName);
          } else {
            // Insert new CV
            await client.query(`
              INSERT INTO candidate_documents (
                id, contact_id, type, name, content, file_size, uploaded_date, uploaded_by, notes, created_at
              ) VALUES ($1, $2, 'cv', $3, $4, $5, NOW(), 'website_part1', $6, NOW())
            `, [
              docId,
              candidateId,
              cvFileData.fileName,
              cvFileData.content,
              cvFileData.size,
              notes
            ]);
            console.log('✅ CV document saved to database:', cvFileData.fileName);
          }
          
          // Also save extracted text and AI data to contact record if available
          if (cvFileData.extractedText || cvFileData.aiExtractedData) {
            try {
              let cvNotes = '';
              if (cvFileData.aiExtractedData) {
                const ai = cvFileData.aiExtractedData;
                cvNotes = `CV AI-Extracted Data:\n\n`;
                if (ai.skills) cvNotes += `Skills: ${ai.skills}\n`;
                if (ai.experience) cvNotes += `Experience: ${ai.experience}\n`;
                if (ai.education) cvNotes += `Education: ${ai.education}\n`;
                
                if (ai.employmentHistory && ai.employmentHistory.length > 0) {
                  cvNotes += `\nPrevious Employment:\n`;
                  ai.employmentHistory.forEach((job, i) => {
                    cvNotes += `\n${i + 1}. ${job.position} at ${job.company}\n`;
                    cvNotes += `   ${job.startDate} - ${job.endDate}\n`;
                    if (job.description) cvNotes += `   ${job.description}\n`;
                  });
                }
                
                if (ai.key_achievements && ai.key_achievements.length > 0) {
                  cvNotes += `\nKey Achievements:\n${ai.key_achievements.map((a, i) => `${i + 1}. ${a}`).join('\n')}`;
                }
              }
              
              await client.query(`
                UPDATE contacts 
                SET cv_text = $1, cv_parsed_at = NOW(), notes = COALESCE(notes || E'\n\n', '') || $2
                WHERE id = $3
              `, [cvFileData.extractedText, cvNotes, candidateId]);
              console.log('✅ CV text and AI data saved to contact record');
            } catch (textError) {
              console.warn('⚠️ Could not save CV text to contact:', textError.message);
            }
          }
        } catch (cvError) {
          console.error('⚠️ Failed to save CV document:', cvError);
        }
      }
      
      // Also create/update registration record in candidate_registrations table
      if (result.rowCount > 0) {
        await client.query(`
          INSERT INTO candidate_registrations (
            candidate_id, registration_status, created_at, updated_at
          ) VALUES ($1, 'registered', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT (candidate_id) 
          DO UPDATE SET 
            registration_status = 'registered',
            updated_at = CURRENT_TIMESTAMP
        `, [candidateId]);
        
        // Log activity for Part 1 completion
        const activityId = `ACT_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
        await client.query(`
          INSERT INTO activities (
            id, subject_type, subject_id, type, summary, details, created_at
          ) VALUES ($1, 'candidate', $2, 'part1_completed', 'Part 1 registration completed via website', $3, CURRENT_TIMESTAMP)
        `, [
          activityId,
          candidateId,
          JSON.stringify({
            completed_at: new Date().toISOString(),
            source: 'website'
          })
        ]);
      }
      
      if (result.rowCount > 0) {
        console.log('✅ Successfully updated candidate:', candidateId);
      } else {
        console.warn('⚠️ No candidate found to update, ID:', candidateId);
      }
    } else {
      console.log('✨ Creating new candidate from website registration');
      
      // Generate new candidate ID
      const newCandidateId = `CAND_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Insert new candidate into contacts table with ALL Part 1 fields
      const insertQuery = `
        INSERT INTO contacts (
          id, name, email, phone, date_of_birth, address, postcode, location,
          gender, nationality, right_to_work, visa_type, visa_expiry,
          industries, availability, shifts, transport, max_travel_distance,
          experience_summary, years_of_experience, experience_level, hourly_rate, preferred_job_types,
          flt_license, flt_types, other_licenses,
          medical_conditions, disability_info, reasonable_adjustments,
          skills, employment_history,
          type, source, status, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
          $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31,
          'candidate', 'website_registration', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        RETURNING id
      `;
      
      // Merge AI-extracted data with form data (form data takes priority)
      const aiData = cvFileData?.aiExtractedData || {};
      
      // Convert years_of_experience string to number (e.g., "2-5" -> 3) and calculate experience_level (INSERT)
      let yearsExpInsert = null;
      let experienceLevelInsert = null;
      const yearsStrInsert = registrationData.yearsOfExperience || aiData.years_of_experience;
      
      if (yearsStrInsert) {
        if (yearsStrInsert === '0-1') {
          yearsExpInsert = 0;
          experienceLevelInsert = 'entry';
        } else if (yearsStrInsert === '1-2') {
          yearsExpInsert = 1;
          experienceLevelInsert = 'entry';
        } else if (yearsStrInsert === '2-5' || yearsStrInsert === '0-2' || yearsStrInsert === '3-5') {
          yearsExpInsert = 3;
          experienceLevelInsert = 'mid';
        } else if (yearsStrInsert === '5-10' || yearsStrInsert === '6-10') {
          yearsExpInsert = 7;
          experienceLevelInsert = 'senior';
        } else if (yearsStrInsert === '10+') {
          yearsExpInsert = 12;
          experienceLevelInsert = 'lead';
        } else {
          yearsExpInsert = parseInt(yearsStrInsert) || null;
          // Calculate experience level from numeric value
          if (yearsExpInsert !== null) {
            if (yearsExpInsert < 2) experienceLevelInsert = 'entry';
            else if (yearsExpInsert < 5) experienceLevelInsert = 'mid';
            else if (yearsExpInsert < 10) experienceLevelInsert = 'senior';
            else experienceLevelInsert = 'lead';
          }
        }
      }
      
      // Merge employment history from form and AI (INSERT path)
      let employmentHistoryInsert = registrationData.employmentHistory || aiData.employmentHistory || null;
      if (typeof employmentHistoryInsert === 'string') {
        try {
          employmentHistoryInsert = JSON.parse(employmentHistoryInsert);
        } catch (e) {
          console.warn('Could not parse employment history:', e);
          employmentHistoryInsert = null;
        }
      }
      
      const insertResult = await client.query(insertQuery, [
        newCandidateId,
        `${registrationData.firstName} ${registrationData.lastName}`,
        registrationData.email || aiData.email,
        registrationData.phone || aiData.phone,
        registrationData.dateOfBirth || null,
        registrationData.address || aiData.location,
        registrationData.postcode || aiData.postcode,
        `${registrationData.address || aiData.location}, ${registrationData.postcode || aiData.postcode}`,
        registrationData.gender,
        registrationData.nationality,
        registrationData.rightToWork,
        registrationData.visaType || null,
        registrationData.visaExpiry || null,
        registrationData.industries || aiData.industries || null,
        registrationData.availability || null,
        registrationData.shifts || aiData.shifts?.join(', ') || null,
        registrationData.transport || null,
        registrationData.maxTravelDistance || null,
        registrationData.experience || aiData.experience || null,
        yearsExpInsert,
        experienceLevelInsert,
        registrationData.expectedHourlyRate || aiData.hourly_rate || null,
        registrationData.jobTypes || aiData.job_types || null,
        registrationData.fltLicense || false,
        registrationData.fltTypes || null,
        registrationData.otherLicenses || null,
        registrationData.medicalConditions || null,
        registrationData.disabilityInfo || null,
        registrationData.reasonableAdjustments || null,
        aiData.skills || null,
        employmentHistoryInsert ? JSON.stringify(employmentHistoryInsert) : null
      ]);
      
      if (insertResult.rowCount > 0) {
        console.log('✅ Successfully created new candidate:', newCandidateId);
        
        // Save CV document if uploaded (stored as base64 in database)
        if (cvFileData) {
          try {
            const docId = `DOC_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
            
            // Build notes with parsing info
            let notes = 'CV uploaded via Part 1 registration';
            if (cvFileData.extractedText) {
              notes += ` | Parsed: ${cvFileData.wordCount} words extracted`;
            }
            
            await client.query(`
              INSERT INTO candidate_documents (
                id, contact_id, type, name, content, file_size, uploaded_date, uploaded_by, notes, created_at
              ) VALUES ($1, $2, 'cv', $3, $4, $5, NOW(), 'website_part1', $6, NOW())
            `, [
              docId,
              newCandidateId,
              cvFileData.fileName,
              cvFileData.content, // Base64 encoded file content
              cvFileData.size,
              notes
            ]);
            console.log('✅ CV document saved to database:', cvFileData.fileName, `(${cvFileData.size} bytes)`);
            
            // Also save extracted text and AI data to contact record if available
            if (cvFileData.extractedText || cvFileData.aiExtractedData) {
              try {
                // Build notes with AI-extracted data
                let cvNotes = '';
                if (cvFileData.aiExtractedData) {
                  const ai = cvFileData.aiExtractedData;
                  cvNotes = `CV AI-Extracted Data:\n\n`;
                  if (ai.skills) cvNotes += `Skills: ${ai.skills}\n`;
                  if (ai.experience) cvNotes += `Experience: ${ai.experience}\n`;
                  if (ai.education) cvNotes += `Education: ${ai.education}\n`;
                  
                  // Add employment history
                  if (ai.employmentHistory && ai.employmentHistory.length > 0) {
                    cvNotes += `\nPrevious Employment:\n`;
                    ai.employmentHistory.forEach((job, i) => {
                      cvNotes += `\n${i + 1}. ${job.position} at ${job.company}\n`;
                      cvNotes += `   ${job.startDate} - ${job.endDate}\n`;
                      if (job.description) cvNotes += `   ${job.description}\n`;
                    });
                  }
                  
                  if (ai.key_achievements && ai.key_achievements.length > 0) {
                    cvNotes += `\nKey Achievements:\n${ai.key_achievements.map((a, i) => `${i + 1}. ${a}`).join('\n')}`;
                  }
                }
                
                await client.query(`
                  UPDATE contacts 
                  SET cv_text = $1, cv_parsed_at = NOW(), notes = COALESCE(notes || E'\n\n', '') || $2
                  WHERE id = $3
                `, [cvFileData.extractedText, cvNotes, newCandidateId]);
                console.log('✅ CV text and AI data saved to contact record');
              } catch (textError) {
                console.warn('⚠️ Could not save CV text to contact (column may not exist):', textError.message);
              }
            }
          } catch (cvError) {
            console.error('⚠️ Failed to save CV document:', cvError);
          }
        }
        
        // Create registration record
        await client.query(`
          INSERT INTO candidate_registrations (
            candidate_id, registration_status, created_at, updated_at
          ) VALUES ($1, 'registered', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, [newCandidateId]);
        
        // Log activity for new registration
        const activityId = `ACT_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
        await client.query(`
          INSERT INTO activities (
            id, subject_type, subject_id, type, summary, details, created_at
          ) VALUES ($1, 'candidate', $2, 'registration', 'Candidate registered via website', $3, CURRENT_TIMESTAMP)
        `, [
          activityId,
          newCandidateId,
          JSON.stringify({
            completed_at: new Date().toISOString(),
            source: 'website',
            email: registrationData.email
          })
        ]);
      }
    }
    
    // Create screening task instead of auto-sending Part 2
    // Part 2 will only be sent AFTER a consultant reviews the candidate and approves them
    const finalCandidateId = isUpdate ? candidateId : (registrationData.candidateId || candidateId);
    const candidateEmail = registrationData.email;
    const candidateName = `${registrationData.firstName} ${registrationData.lastName}`.trim();
    
    if (finalCandidateId) {
      try {
        console.log('� Creating screening task for candidate:', finalCandidateId);
        const screenTaskId = `TASK_SCREEN_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
        await client.query(`
          INSERT INTO tasks (id, title, description, type, priority, status, contact_id, due_date, created_at)
          VALUES ($1, $2, $3, 'candidate_screening', 'high', 'pending', $4, CURRENT_TIMESTAMP + INTERVAL '4 hours', CURRENT_TIMESTAMP)
        `, [
          screenTaskId,
          `Screen New Candidate — ${candidateName}`,
          `${candidateName} just completed Part 1 registration. Review their CV, call them, and decide:\n• Suitable for: Temp / Perm / Both / Not suitable\n• Disposition: Approve / Needs info / Reject\n\nEmail: ${candidateEmail || 'N/A'}\nPhone: ${registrationData.phone || 'N/A'}`,
          finalCandidateId
        ]);
        
        // Log activity
        const screenActivityId = `ACT_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
        await client.query(`
          INSERT INTO activities (
            id, subject_type, subject_id, type, summary, details, created_at
          ) VALUES ($1, 'candidate', $2, 'screening_task_created', 'Screening task created — pending consultant review before Part 2', $3, CURRENT_TIMESTAMP)
        `, [
          screenActivityId,
          finalCandidateId,
          JSON.stringify({ task_id: screenTaskId, candidate_name: candidateName, created_at: new Date().toISOString() })
        ]);
        
        // Send notification to consultants
        try {
          const railwayUrl = process.env.RAILWAY_BACKEND_URL || 'https://damedesk-production.up.railway.app';
          await fetch(`${railwayUrl}/notifications/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'new_registration_screen',
              title: `New Registration — ${candidateName}`,
              message: `${candidateName} completed Part 1. Please screen and approve before Part 2 is sent.`,
              icon: 'person-add-outline',
              color: '#3B82F6',
              linkType: 'contact',
              linkId: finalCandidateId,
            }),
          });
        } catch (notifErr) {
          console.warn('⚠️ Notification send failed (non-critical):', notifErr.message);
        }
        
        console.log('✅ Screening task created:', screenTaskId);
      } catch (taskError) {
        console.warn('⚠️ Failed to create screening task:', taskError.message);
        // Non-critical — don't fail the registration
      }
    }

    await client.end();
    console.log('✅ Successfully saved to database');
    
  } catch (error) {
    console.error('❌ Database error:', error);
    await client.end();
    throw error;
  }
}

// Auto-send Part 2 registration invitation email after Part 1 completion
async function sendPart2InvitationEmail(email, name, candidateId) {
  const nodemailer = require('nodemailer');
  
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️ SMTP credentials not configured — skipping Part 2 invitation email');
    
    // Fallback: try Railway backend notification endpoint
    try {
      const railwayUrl = process.env.RAILWAY_BACKEND_URL || 'https://damedesk-production.up.railway.app';
      await fetch(`${railwayUrl}/notifications/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'part2_invitation_needed',
          title: 'Part 2 Invitation Needed',
          message: `${name} completed Part 1 — please send Part 2 link manually (no SMTP configured)`,
          icon: 'mail-outline',
          color: '#F59E0B',
          linkType: 'contact',
          linkId: candidateId,
        }),
      });
    } catch (notifErr) {
      console.warn('⚠️ Failed to send fallback notification:', notifErr.message);
    }
    return;
  }
  
  const part2Link = `https://www.damerecruitment.co.uk/part2registration?id=${candidateId}`;
  const firstName = name.split(' ')[0] || 'there';
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.office365.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  
  await transporter.sendMail({
    from: `"Dame Recruitment" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Almost There! Complete Your Registration - Dame Recruitment',
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="background-color:#dc2626;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0;">
      <h1 style="margin:0;">Dame Recruitment</h1>
      <p style="margin:5px 0 0;">Complete Your Registration</p>
    </div>
    <div style="padding:30px 20px;background:#f9f9f9;border-radius:0 0 8px 8px;">
      <h3>Hi ${firstName},</h3>
      <p>Thank you for completing Part 1 of your registration! You're almost work-ready.</p>
      <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:15px;margin:20px 0;">
        <strong>Next Step:</strong> Complete Part 2 to become eligible for work assignments.
      </div>
      <p>Part 2 takes just <strong>5-10 minutes</strong> and covers:</p>
      <ul>
        <li>Bank details for payment</li>
        <li>National Insurance number</li>
        <li>Right to work verification</li>
        <li>Emergency contact</li>
        <li>Contract signature</li>
      </ul>
      <p style="text-align:center;margin:25px 0;">
        <a href="${part2Link}" style="display:inline-block;background:#dc2626;color:white;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:16px;">Complete Part 2 Now</a>
      </p>
      <p>Once completed, we can start placing you immediately.</p>
      <p>Questions? Call us on <strong>0115 888 2233</strong> or email <strong>info@damerecruitment.co.uk</strong></p>
    </div>
    <div style="text-align:center;padding:15px;font-size:12px;color:#666;">
      <p>Dame Recruitment Ltd | Innovation House, Nottingham Business Park, NG8 6PY</p>
    </div>
  </div>
</body>
</html>`,
    text: `Hi ${firstName},\n\nThank you for completing Part 1 of your registration!\n\nPlease complete Part 2 to become work-ready: ${part2Link}\n\nThis takes 5-10 minutes and covers bank details, NI number, right to work, emergency contact, and contract.\n\nQuestions? Call 0115 888 2233\n\nDame Recruitment Team`,
  });
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

// Parse CV file to extract text
async function parseCVFile(buffer, mimeType, fileName) {
  console.log('🔍 Parsing CV:', fileName, mimeType);
  
  try {
    let extractedText = '';
    
    // Parse PDF files
    if (mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      extractedText = data.text;
      console.log('📄 PDF parsed:', data.numpages, 'pages');
    }
    // Parse Word documents (.docx)
    else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.toLowerCase().endsWith('.docx')) {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer: buffer });
      extractedText = result.value;
      console.log('📄 DOCX parsed');
    }
    // Parse old Word documents (.doc)
    else if (mimeType === 'application/msword' || fileName.toLowerCase().endsWith('.doc')) {
      console.log('⚠️ .doc files require special parsing - extracting as text');
      // .doc files are binary and harder to parse - would need textract or similar
      extractedText = 'DOC file uploaded - text extraction not available for .doc format. Please use .docx or PDF.';
    }
    else {
      console.log('⚠️ Unsupported file type for parsing:', mimeType);
      extractedText = 'File uploaded - text extraction not available for this file type.';
    }
    
    // Clean up text
    extractedText = extractedText.trim();
    const wordCount = extractedText.split(/\s+/).length;
    
    return {
      text: extractedText,
      wordCount: wordCount,
      success: true
    };
  } catch (error) {
    console.error('❌ CV parsing error:', error);
    throw error;
  }
}

// Use AI to extract structured data from CV text
async function parseWithAI(cvText) {
  const OpenAI = require('openai');
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  console.log('🤖 Calling OpenAI to extract structured data...');
  
  const prompt = `Extract the following information from this CV/resume. Return ONLY valid JSON with no markdown formatting or code blocks.

CV Text:
${cvText.substring(0, 15000)}

Return JSON in this exact format:
{
  "name": "Full name",
  "email": "Email address",
  "phone": "Phone number",
  "location": "City/area",
  "postcode": "Postcode if available",
  "skills": "Comma-separated list of key skills",
  "experience_level": "Entry/Mid/Senior",
  "years_of_experience": "Number of years as integer",
  "industries": "Comma-separated industries worked in",
  "job_types": "Comma-separated job types (e.g. Warehouse, Manufacturing, Logistics)",
  "hourly_rate": "Expected hourly rate as number or null",
  "expected_annual_salary": "Expected salary as number or null",
  "notice_period_days": "Notice period in days as integer or null",
  "experience_summary": "Brief 2-3 sentence summary of experience",
  "education": "Highest qualification",
  "key_achievements": "Top 3-5 achievements as array",
  "employmentHistory": "Array of previous jobs with company, position, startDate, endDate, description"
}

Use "N/A" for missing text fields, null for missing numbers, and empty array for missing arrays.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a CV parsing assistant. Extract structured data from CVs and return valid JSON only, with no markdown formatting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const responseText = completion.choices[0].message.content.trim();
    console.log('🤖 OpenAI response:', responseText.substring(0, 200) + '...');
    
    // Remove markdown code blocks if present
    let jsonText = responseText;
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    const parsedData = JSON.parse(jsonText);
    console.log('✅ AI parsing successful:', Object.keys(parsedData));
    
    return parsedData;
  } catch (error) {
    console.error('❌ AI parsing failed:', error);
    throw error;
  }
}
