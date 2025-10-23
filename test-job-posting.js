// Test the live job posting function
const fetch = require('node-fetch');

async function testJobPosting() {
  console.log('🧪 Testing LIVE Job Posting Form on Netlify...\n');

  try {
    const response = await fetch('https://damerecruitment.co.uk/.netlify/functions/job-posting', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'website-integration'
      },
      body: JSON.stringify({
        companyName: 'Test Warehouse Ltd',
        contactName: 'John Manager',
        email: 'john@testwarehouse.com',
        phone: '01162345678',
        jobTitle: 'Warehouse Operative - Day Shift',
        jobType: 'temporary',
        location: 'Leicester, LE1',
        description: 'We need 5 warehouse operatives for our busy distribution center. Immediate start available.',
        urgency: 'urgent'
      })
    });

    const result = await response.json();
    
    console.log('📊 Response Status:', response.status);
    console.log('📋 Response Body:', JSON.stringify(result, null, 2));
    
    if (result.success && result.savedToDatabase) {
      console.log('\n✅ SUCCESS! Job posting saved to database!');
      console.log('📍 Client ID:', result.clientId);
      console.log('📍 Job ID:', result.jobId);
      console.log('📍 Task ID:', result.taskId);
      console.log('📍 Assigned To:', result.assignedTo || 'Unassigned (manager to assign)');
      console.log('\n🎯 Check DameDesk:');
      console.log('   - Clients page: Should see "Test Warehouse Ltd" (Hot 🔥)');
      console.log('   - Jobs page: Should see "Warehouse Operative - Day Shift" (Open)');
      console.log('   - Tasks page: Should see follow-up task');
    } else {
      console.log('\n❌ FAILED - Job posting not saved to database');
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

testJobPosting();
