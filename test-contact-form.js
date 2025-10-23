// Test contact form Netlify function locally
const handler = require('./netlify/functions/contact-form').handler;

async function testContactForm() {
  console.log('🧪 Testing Contact Form...\n');

  // Test 1: Job Seeker Inquiry
  console.log('Test 1: Job Seeker Inquiry');
  const jobSeekerEvent = {
    httpMethod: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Test Job Seeker',
      email: 'jobseeker@test.com',
      phone: '07700900123',
      company: '',
      message: 'I am looking for warehouse work',
      inquiryType: 'job_seeker'
    })
  };

  const result1 = await handler(jobSeekerEvent, {});
  console.log('Result:', JSON.parse(result1.body));
  console.log('Expected: type=candidate, temperature=warm\n');

  // Test 2: Employer Inquiry
  console.log('Test 2: Employer Inquiry');
  const employerEvent = {
    httpMethod: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Test Employer',
      email: 'employer@testcompany.com',
      phone: '07700900456',
      company: 'Test Company Ltd',
      message: 'We need warehouse staff urgently',
      inquiryType: 'employer'
    })
  };

  const result2 = await handler(employerEvent, {});
  console.log('Result:', JSON.parse(result2.body));
  console.log('Expected: type=prospect, temperature=hot\n');

  // Test 3: General Inquiry
  console.log('Test 3: General Inquiry');
  const generalEvent = {
    httpMethod: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Test General',
      email: 'general@test.com',
      message: 'I have a general question',
      inquiryType: 'general'
    })
  };

  const result3 = await handler(generalEvent, {});
  console.log('Result:', JSON.parse(result3.body));
  console.log('Expected: type=contact, temperature=warm\n');

  console.log('✅ All tests completed!');
}

testContactForm().catch(console.error);
