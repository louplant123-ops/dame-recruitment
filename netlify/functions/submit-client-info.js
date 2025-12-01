const { Client } = require('pg');

/**
 * Netlify Function: Submit Client Info
 * Handles client information form submissions from the website
 */

// Helper function to convert string values to boolean
const convertToBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase().trim();
    // Handle various string representations
    if (lowerValue === 'true' || lowerValue === 'yes' || lowerValue === '1') return true;
    if (lowerValue === 'false' || lowerValue === 'no' || lowerValue === '0') return false;
    // Handle "Client provides" / "Employee provides" type values
    if (lowerValue.includes('client') || lowerValue.includes('yes')) return true;
    if (lowerValue.includes('employee') || lowerValue.includes('no')) return false;
  }
  return null; // Return null for undefined/null values
};

// Database connection
const connectToDatabase = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  await client.connect();
  console.log('✅ Connected to database');
  return client;
};

// Update or insert client information
const updateClientInfo = async (client, formData) => {
  const {
    companyName,
    companyNumber,
    vatNumber,
    industry,
    companySize,
    website,
    contactName,
    jobTitle,
    email,
    phone,
    accountsContactName,
    accountsContactEmail,
    accountsContactPhone,
    address,
    postcode,
    // Additional fields that might be booleans
    ppeProvided,
    uniformProvided,
    parkingAvailable,
    ...otherFields
  } = formData;

  // Convert potential boolean fields
  const ppeProvidedBool = convertToBoolean(ppeProvided);
  const uniformProvidedBool = convertToBoolean(uniformProvided);
  const parkingAvailableBool = convertToBoolean(parkingAvailable);

  const query = `
    INSERT INTO clients (
      company_name,
      company_number,
      vat_number,
      industry,
      company_size,
      website,
      contact_name,
      job_title,
      email,
      phone,
      accounts_contact_name,
      accounts_contact_email,
      accounts_contact_phone,
      address,
      postcode,
      ppe_provided,
      uniform_provided,
      parking_available,
      type,
      status,
      source,
      created_at,
      updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16, $17, $18,
      'client', 'prospect', 'website_form', NOW(), NOW()
    )
    ON CONFLICT (email) 
    DO UPDATE SET
      company_name = EXCLUDED.company_name,
      company_number = EXCLUDED.company_number,
      vat_number = EXCLUDED.vat_number,
      industry = EXCLUDED.industry,
      company_size = EXCLUDED.company_size,
      website = EXCLUDED.website,
      contact_name = EXCLUDED.contact_name,
      job_title = EXCLUDED.job_title,
      phone = EXCLUDED.phone,
      accounts_contact_name = EXCLUDED.accounts_contact_name,
      accounts_contact_email = EXCLUDED.accounts_contact_email,
      accounts_contact_phone = EXCLUDED.accounts_contact_phone,
      address = EXCLUDED.address,
      postcode = EXCLUDED.postcode,
      ppe_provided = EXCLUDED.ppe_provided,
      uniform_provided = EXCLUDED.uniform_provided,
      parking_available = EXCLUDED.parking_available,
      updated_at = NOW()
    RETURNING id;
  `;

  const values = [
    companyName,
    companyNumber || null,
    vatNumber || null,
    industry,
    companySize || null,
    website || null,
    contactName,
    jobTitle || null,
    email,
    phone,
    accountsContactName || null,
    accountsContactEmail || null,
    accountsContactPhone || null,
    address || null,
    postcode || null,
    ppeProvidedBool,
    uniformProvidedBool,
    parkingAvailableBool
  ];

  const result = await client.query(query, values);
  return result.rows[0];
};

// Main handler
exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  let dbClient;

  try {
    // Parse form data
    const formData = JSON.parse(event.body);
    
    console.log('📝 Received client info submission:', {
      company: formData.companyName,
      email: formData.email,
      hasAccountsContact: !!(formData.accountsContactName || formData.accountsContactEmail)
    });

    // Connect to database
    dbClient = await connectToDatabase();

    // Update client info
    const client = await updateClientInfo(dbClient, formData);
    
    console.log('✅ Client info saved successfully:', client.id);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Client information saved successfully',
        clientId: client.id
      })
    };

  } catch (error) {
    console.error('❌ Client info submission error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Failed to save client information',
        details: error.message
      })
    };

  } finally {
    // Close database connection
    if (dbClient) {
      await dbClient.end();
    }
  }
};
