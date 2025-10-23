// Test the live timesheet submission function
const fetch = require('node-fetch');

async function testTimesheetSubmission() {
  console.log('🧪 Testing LIVE Timesheet Submission on Netlify...\n');

  try {
    const response = await fetch('https://damerecruitment.co.uk/.netlify/functions/timesheet-submission', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'website-integration'
      },
      body: JSON.stringify({
        clientId: 'CLIENT_1761080492992_1bi8hfcso', // Use the test client we created earlier
        weekEnding: '2025-01-26',
        submittedBy: 'Test Manager',
        clientNotes: 'All workers performed well this week',
        workers: [
          {
            id: 'worker1',
            name: 'John Smith',
            entries: [
              { date: '2025-01-20', hours: 8, charge_rate: 15.50, client_notes: 'Good work' },
              { date: '2025-01-21', hours: 8, charge_rate: 15.50, client_notes: '' },
              { date: '2025-01-22', hours: 8, charge_rate: 15.50, client_notes: '' },
              { date: '2025-01-23', hours: 8, charge_rate: 15.50, client_notes: '' },
              { date: '2025-01-24', hours: 8, charge_rate: 15.50, client_notes: '' }
            ]
          },
          {
            id: 'worker2',
            name: 'Sarah Johnson',
            entries: [
              { date: '2025-01-20', hours: 7.5, charge_rate: 14.00, client_notes: '' },
              { date: '2025-01-21', hours: 8, charge_rate: 14.00, client_notes: '' },
              { date: '2025-01-22', hours: 8, charge_rate: 14.00, client_notes: '' },
              { date: '2025-01-23', hours: 8, charge_rate: 14.00, client_notes: 'Left early - appointment' },
              { date: '2025-01-24', hours: 8, charge_rate: 14.00, client_notes: '' }
            ]
          }
        ],
        totals: {
          totalHours: 79.5,
          totalCharge: 1175.50,
          totalPay: 0,
          totalMargin: 0
        }
      })
    });

    const result = await response.json();
    
    console.log('📊 Response Status:', response.status);
    console.log('📋 Response Body:', JSON.stringify(result, null, 2));
    
    if (result.success && result.savedToDatabase) {
      console.log('\n✅ SUCCESS! Timesheet saved to database!');
      console.log('📍 Timesheet ID:', result.timesheetId);
      console.log('📍 Entry Count:', result.entryCount);
      console.log('📍 Task ID:', result.taskId);
      console.log('📍 Status:', result.status);
      console.log('\n🎯 Check DameDesk:');
      console.log('   - Tasks page: Should see "Approve Timesheet" task (High priority)');
      console.log('   - Timesheet shows: 2 workers, 79.5 total hours, week ending 2025-01-26');
    } else {
      console.log('\n❌ FAILED - Timesheet not saved to database');
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

testTimesheetSubmission();
