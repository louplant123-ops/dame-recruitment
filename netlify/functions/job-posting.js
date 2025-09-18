const fetch = require('node-fetch');

exports.handler = async (event, context) => {
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

  try {
    console.log('💼 Job posting form submission received');
    
    // Parse the form data
    let jobData;
    const contentType = event.headers['content-type'] || '';
    
    if (contentType.includes('application/json')) {
      jobData = JSON.parse(event.body);
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const params = new URLSearchParams(event.body);
      jobData = Object.fromEntries(params);
    } else {
      throw new Error('Unsupported content type');
    }

    console.log('📋 Job posting data parsed:', {
      companyName: jobData.companyName,
      jobTitle: jobData.jobTitle,
      jobType: jobData.jobType,
      location: jobData.location,
      contactName: jobData.contactName,
      email: jobData.email
    });

    // Validate required fields
    const requiredFields = ['companyName', 'contactName', 'email', 'jobTitle', 'jobType', 'location', 'description', 'urgency'];
    const missingFields = requiredFields.filter(field => !jobData[field]);
    
    if (missingFields.length > 0) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        })
      };
    }

    // Prepare data for DameDesk
    const submissionData = {
      ...jobData,
      submissionType: 'job_posting',
      timestamp: new Date().toISOString(),
      source: 'website_job_posting_form'
    };

    // Forward to DameDesk bridge server
    const webhookUrl = process.env.DAMEDESK_JOB_WEBHOOK_URL || 'http://localhost:3001/api/jobs';
    if (!webhookUrl) {
      throw new Error('DAMEDESK_JOB_WEBHOOK_URL not configured');
    }

    console.log('🔗 Forwarding to DameDesk bridge server...');
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.NEXT_PUBLIC_DAMEDESK_API_KEY || 'dame-api-key-2024'
      },
      body: JSON.stringify(submissionData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ DameDesk bridge server error:', response.status, errorText);
      throw new Error(`Bridge server error: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Successfully forwarded to DameDesk:', result);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'Job posting submitted successfully',
        jobId: result.jobId || `JOB_${Date.now()}`,
        clientId: result.clientId || `CLIENT_${Date.now()}`
      })
    };

  } catch (error) {
    console.error('💥 Job posting error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to process job posting submission'
      })
    };
  }
};
