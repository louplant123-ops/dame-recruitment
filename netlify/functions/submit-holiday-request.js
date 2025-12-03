const { Client } = require('pg');
const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const formData = JSON.parse(event.body);

    console.log('📝 Submitting holiday request for:', formData.candidateName);

    // Validate required fields
    if (!formData.candidateId || !formData.startDate || !formData.endDate) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Connect to database
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
    });

    await client.connect();

    try {
      // Insert holiday request into database
      const result = await client.query(
        `INSERT INTO holiday_requests 
         (candidate_id, start_date, end_date, total_days, leave_type, reason, 
          client_approved, client_name, approved_by, status, submitted_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
         RETURNING *`,
        [
          formData.candidateId,
          formData.startDate,
          formData.endDate,
          formData.totalDays,
          formData.leaveType,
          formData.reason,
          formData.clientApproved,
          formData.clientName || null,
          formData.approvedBy || null,
          'pending'
        ]
      );

      const holiday = result.rows[0];
      console.log('✅ Holiday request created:', holiday.id);

      // Create timeline event for holiday request
      try {
        const historyId = `HIST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const insertHistoryQuery = `
          INSERT INTO client_history (
            id, client_id, event_type, event_action, event_date,
            user_name, description, metadata, created_at
          ) VALUES ($1, $2, 'holiday', 'requested', NOW(), $3, $4, $5, NOW())
        `;

        const historyValues = [
          historyId,
          formData.candidateId,
          formData.candidateName,
          `Holiday request: ${formData.startDate} to ${formData.endDate} (${formData.totalDays} days)`,
          JSON.stringify({
            holiday_id: holiday.id,
            start_date: formData.startDate,
            end_date: formData.endDate,
            total_days: formData.totalDays,
            leave_type: formData.leaveType,
            reason: formData.reason,
            client_approved: formData.clientApproved,
            client_name: formData.clientName,
            submitted_at: new Date().toISOString()
          })
        ];

        await client.query(insertHistoryQuery, historyValues);
        console.log('✅ Timeline event created for holiday request');
      } catch (historyError) {
        console.error('⚠️ Failed to create timeline event:', historyError);
        // Continue anyway - holiday request is complete
      }

    // Send notification email to office
    const officeEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #14b8a6 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .details { background: white; border-radius: 10px; padding: 20px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-label { font-weight: bold; color: #6b7280; }
          .detail-value { color: #111827; }
          .badge { display: inline-block; padding: 5px 10px; border-radius: 5px; font-size: 12px; font-weight: bold; }
          .badge-pending { background: #fef3c7; color: #92400e; }
          .badge-approved { background: #d1fae5; color: #065f46; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏖️ New Holiday Request</h1>
          </div>
          <div class="content">
            <p><strong>${formData.candidateName}</strong> has submitted a holiday request:</p>
            
            <div class="details">
              <div class="detail-row">
                <span class="detail-label">Candidate:</span>
                <span class="detail-value">${formData.candidateName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${formData.candidateEmail}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Start Date:</span>
                <span class="detail-value">${formData.startDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">End Date:</span>
                <span class="detail-value">${formData.endDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Total Days:</span>
                <span class="detail-value">${formData.totalDays} day${formData.totalDays !== 1 ? 's' : ''}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Leave Type:</span>
                <span class="detail-value">${formData.leaveType}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Reason:</span>
                <span class="detail-value">${formData.reason}</span>
              </div>
              ${formData.clientApproved ? `
              <div class="detail-row">
                <span class="detail-label">Client Approved:</span>
                <span class="detail-value">✓ Yes - ${formData.clientName} (${formData.approvedBy})</span>
              </div>
              ` : ''}
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value"><span class="badge badge-pending">PENDING REVIEW</span></span>
              </div>
            </div>
            
            <p>Please review this request in the CRM.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'Dame Recruitment <noreply@damerecruitment.co.uk>',
      to: 'info@damerecruitment.co.uk',
      subject: `Holiday Request: ${formData.candidateName} - ${formData.startDate} to ${formData.endDate}`,
      html: officeEmailHtml,
    });

    console.log('✅ Office notification sent');

    // Send confirmation email to candidate
    const candidateEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #14b8a6 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .summary { background: white; border-radius: 10px; padding: 20px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏖️ Holiday Request Received</h1>
          </div>
          <div class="content">
            <p>Hi ${formData.candidateName},</p>
            <p>Your holiday request has been received and is being reviewed.</p>
            
            <div class="summary">
              <p><strong>Request Details:</strong></p>
              <ul>
                <li><strong>Dates:</strong> ${formData.startDate} to ${formData.endDate}</li>
                <li><strong>Total Days:</strong> ${formData.totalDays}</li>
                <li><strong>Type:</strong> ${formData.leaveType}</li>
              </ul>
              ${formData.clientApproved ? `<p>✓ You confirmed this has been approved by ${formData.clientName}</p>` : ''}
            </div>
            
            <p>We'll review your request and get back to you within 24 hours.</p>
            
            <p>If you have any questions, please contact us.</p>
            
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              Dame Recruitment<br>
              Email: info@damerecruitment.co.uk<br>
              Phone: 0115 888 2233
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'Dame Recruitment <noreply@damerecruitment.co.uk>',
      to: formData.candidateEmail,
      subject: 'Holiday Request Received - Dame Recruitment',
      html: candidateEmailHtml,
    });

      console.log('✅ Candidate confirmation sent');

      await client.end();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true,
          holidayId: holiday.id,
          message: 'Holiday request submitted successfully'
        }),
      };

    } catch (dbError) {
      console.error('❌ Database error:', dbError);
      await client.end();
      throw dbError;
    }

  } catch (error) {
    console.error('❌ Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
