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

// Generate 6-digit code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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
    const { email } = JSON.parse(event.body);

    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email is required' }),
      };
    }

    console.log('🔍 Looking up candidate with email:', email);

    // Connect to database
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
    });

    await client.connect();

    try {
      // Find candidate by email
      const result = await client.query(
        `SELECT id, name, email, type FROM contacts WHERE email = $1 AND type = 'candidate'`,
        [email.toLowerCase()]
      );

      if (result.rows.length === 0) {
        console.log('❌ Candidate not found:', email);
        await client.end();
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ 
            error: 'No candidate found with this email address. Please contact the office.' 
          }),
        };
      }

      const candidate = result.rows[0];
      console.log('✅ Candidate found:', candidate.name);

    // Generate verification code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log('🔐 Generated code:', code);

      // Store verification code in database
      await client.query(
        `INSERT INTO verification_codes (email, code, expires_at, type, candidate_id, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [email.toLowerCase(), code, expiresAt.toISOString(), 'holiday_request', candidate.id]
      );

      console.log('✅ Verification code stored');

    // Send verification email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #14b8a6 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .code-box { background: white; border: 2px solid #14b8a6; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
          .code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #14b8a6; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏖️ Holiday Request Verification</h1>
          </div>
          <div class="content">
            <p>Hi ${candidate.name},</p>
            <p>You requested to submit a holiday request. Please use the verification code below to continue:</p>
            
            <div class="code-box">
              <div class="code">${code}</div>
            </div>
            
            <p><strong>This code will expire in 10 minutes.</strong></p>
            
            <p>If you didn't request this code, please ignore this email or contact us if you have concerns.</p>
            
            <div class="footer">
              <p>Dame Recruitment<br>
              Email: info@damerecruitment.co.uk<br>
              Phone: 0115 888 2233</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailText = `
Holiday Request Verification

Hi ${candidate.name},

You requested to submit a holiday request. Please use the verification code below to continue:

CODE: ${code}

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email or contact us if you have concerns.

Dame Recruitment
info@damerecruitment.co.uk
0115 888 2233
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'Dame Recruitment <noreply@damerecruitment.co.uk>',
      to: email,
      subject: 'Your Holiday Request Verification Code',
      html: emailHtml,
      text: emailText,
    });

      console.log('✅ Verification email sent to:', email);

      await client.end();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true,
          message: 'Verification code sent to your email'
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
