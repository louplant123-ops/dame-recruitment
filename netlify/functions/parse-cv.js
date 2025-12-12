// Parse CV and return structured data for form auto-fill
exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { fileData, fileName, mimeType } = JSON.parse(event.body);
    
    console.log('📄 Parsing CV:', fileName, mimeType);
    
    // Convert base64 to buffer
    const buffer = Buffer.from(fileData, 'base64');
    
    // Extract text from file
    let extractedText = '';
    
    if (mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      extractedText = data.text;
      console.log('📄 PDF parsed:', data.numpages, 'pages');
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.toLowerCase().endsWith('.docx')) {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer: buffer });
      extractedText = result.value;
      console.log('📄 DOCX parsed');
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Unsupported file type. Please upload PDF or DOCX.' })
      };
    }
    
    if (!extractedText || extractedText.trim().length < 50) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Could not extract text from CV. Please try a different file.' })
      };
    }
    
    console.log('✅ Text extracted:', extractedText.length, 'characters');
    
    // Use AI to extract structured data
    if (!process.env.OPENAI_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'AI parsing not configured' })
      };
    }
    
    const OpenAI = require('openai');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    console.log('🤖 Calling OpenAI to extract structured data...');
    
    const prompt = `Extract the following information from this CV/resume. Return ONLY valid JSON with no markdown formatting or code blocks.

CV Text:
${extractedText.substring(0, 15000)}

Return JSON in this exact format:
{
  "firstName": "First name only",
  "lastName": "Last name only",
  "email": "Email address or null",
  "phone": "Phone number or null",
  "address": "Full address or null",
  "postcode": "Postcode/ZIP or null",
  "jobTypes": ["temporary", "permanent", "contract"] (array of applicable types),
  "industries": ["warehousing", "manufacturing", "engineering", "construction", "automotive", "food_production"] (array of applicable industries),
  "experience": "Brief 2-3 sentence summary of experience",
  "yearsOfExperience": "0-2" or "3-5" or "6-10" or "10+" (string),
  "expectedHourlyRate": "Expected hourly rate as number or null",
  "shifts": ["day", "night", "weekend"] (array of shift preferences if mentioned),
  "employmentHistory": [
    {
      "company": "Company name",
      "position": "Job title",
      "startDate": "YYYY-MM or YYYY",
      "endDate": "YYYY-MM or YYYY or Present",
      "description": "Brief description of role and responsibilities"
    }
  ]
}

Use null for missing values and empty arrays for missing arrays. Be conservative - only include job types and industries that are clearly mentioned or strongly implied.`;

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
      max_tokens: 800
    });

    const responseText = completion.choices[0].message.content.trim();
    console.log('🤖 OpenAI response received');
    
    // Remove markdown code blocks if present
    let jsonText = responseText;
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    const parsedData = JSON.parse(jsonText);
    console.log('✅ AI parsing successful');
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        data: parsedData
      })
    };
    
  } catch (error) {
    console.error('❌ CV parsing error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Failed to parse CV. Please try again or fill in the form manually.'
      })
    };
  }
};
