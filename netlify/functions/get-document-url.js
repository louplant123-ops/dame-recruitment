const AWS = require('aws-sdk');

const spacesEndpoint = new AWS.Endpoint('fra1.digitaloceanspaces.com');
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_SPACES_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET,
  region: 'fra1'
});

const BUCKET = 'damedesk-storage';
const SIGNED_URL_EXPIRY = 900; // 15 minutes

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

function extractKeyFromUrl(url) {
  try {
    const parsed = new URL(url);
    // Spaces URLs: https://damedesk-storage.fra1.digitaloceanspaces.com/right-to-work/...
    // or https://fra1.digitaloceanspaces.com/damedesk-storage/right-to-work/...
    let key = parsed.pathname.replace(/^\//, '');
    if (key.startsWith(`${BUCKET}/`)) {
      key = key.slice(BUCKET.length + 1);
    }
    return key;
  } catch {
    return null;
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { fileUrl, key } = JSON.parse(event.body || '{}');
    const spacesKey = key || (fileUrl ? extractKeyFromUrl(fileUrl) : null);

    if (!spacesKey) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Missing fileUrl or key parameter' })
      };
    }

    const signedUrl = s3.getSignedUrl('getObject', {
      Bucket: BUCKET,
      Key: spacesKey,
      Expires: SIGNED_URL_EXPIRY
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ signedUrl, expiresIn: SIGNED_URL_EXPIRY })
    };
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Failed to generate signed URL' })
    };
  }
};
