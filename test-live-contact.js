// Test the live contact form function
const fetch = require('node-fetch');

async function testLiveContactForm() {
  console.log('🧪 Testing LIVE Contact Form on Netlify...\n');

  try {
    const response = await fetch('https://damerecruitment.co.uk/.netlify/functions/contact-form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'website-integration'
      },
      body: JSON.stringify({
        name: 'Test Contact from API',
        email: 'test-api@example.com',
        phone: '07700900999',
        company: 'Test Company',
        message: 'Testing the new database integration - this should appear in DameDesk!',
        inquiryType: 'employer'
      })
    });

    const result = await response.json();
    
    console.log('📊 Response Status:', response.status);
    console.log('📋 Response Body:', JSON.stringify(result, null, 2));
    
    if (result.success && result.savedToDatabase) {
      console.log('\n✅ SUCCESS! Contact saved to database!');
      console.log('📍 Contact ID:', result.contactId);
      console.log('📍 Contact Type:', result.contactType);
      console.log('📍 Database Record:', result.dbRecord);
      console.log('\n🎯 Check DameDesk Prospects page - this contact should appear there!');
    } else {
      console.log('\n❌ FAILED - Contact not saved to database');
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

testLiveContactForm();
