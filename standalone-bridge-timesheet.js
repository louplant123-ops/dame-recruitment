// Timesheet Bridge Server Extension
// Handles timesheet submissions from web portal to DameDesk CRM

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Queue file paths
const TIMESHEET_QUEUE_FILE = path.join(__dirname, 'timesheet-queue.json');
const PROCESSED_TIMESHEETS_FILE = path.join(__dirname, 'processed-timesheets.json');

// Utility functions
async function readQueueFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeQueueFile(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

async function addToQueue(filePath, newItem) {
  const queue = await readQueueFile(filePath);
  queue.push(newItem);
  await writeQueueFile(filePath, queue);
}

// Generate unique timesheet ID
function generateTimesheetId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `TIMESHEET_${timestamp}_${random}`;
}

// Validate timesheet submission
function validateTimesheetSubmission(data) {
  const errors = [];

  if (!data.clientId) {
    errors.push('Client ID is required');
  }

  if (!data.weekEndingDate) {
    errors.push('Week ending date is required');
  }

  if (!data.submittedBy || !data.submittedBy.trim()) {
    errors.push('Submitter name is required');
  }

  if (!data.entries || !Array.isArray(data.entries)) {
    errors.push('Timesheet entries are required');
  }

  // Validate entries
  if (data.entries && Array.isArray(data.entries)) {
    data.entries.forEach((entry, index) => {
      if (!entry.candidateId) {
        errors.push(`Entry ${index + 1}: Candidate ID is required`);
      }
      
      if (!entry.workDate) {
        errors.push(`Entry ${index + 1}: Work date is required`);
      }
      
      if (!entry.entryType) {
        errors.push(`Entry ${index + 1}: Entry type is required`);
      }
      
      if (entry.entryType === 'hours' && (!entry.hoursWorked && !entry.calculatedHours)) {
        errors.push(`Entry ${index + 1}: Hours worked is required for hours entry type`);
      }
    });
  }

  return errors;
}

// Process timesheet entry for DameDesk format
function processTimesheetEntry(entry) {
  return {
    candidateId: entry.candidateId,
    candidateName: entry.candidateName,
    workDate: entry.workDate,
    entryType: entry.entryType,
    hoursWorked: entry.hoursWorked || entry.calculatedHours || 0,
    startTime: entry.startTime || null,
    finishTime: entry.finishTime || null,
    breakDuration: entry.breakDuration || 0,
    calculatedHours: entry.calculatedHours || null,
    notes: entry.notes || null,
    submittedAt: new Date().toISOString()
  };
}

// Main timesheet submission endpoint
app.post('/api/timesheets/submit', async (req, res) => {
  try {
    console.log('📋 Timesheet submission received:', {
      clientId: req.body.clientId,
      weekEndingDate: req.body.weekEndingDate,
      submittedBy: req.body.submittedBy,
      entriesCount: req.body.entries?.length || 0
    });

    // Validate submission
    const validationErrors = validateTimesheetSubmission(req.body);
    if (validationErrors.length > 0) {
      console.log('❌ Validation errors:', validationErrors);
      return res.status(400).json({
        success: false,
        errors: validationErrors
      });
    }

    // Generate timesheet ID
    const timesheetId = generateTimesheetId();

    // Process timesheet data
    const processedTimesheet = {
      id: timesheetId,
      clientId: req.body.clientId,
      weekEndingDate: req.body.weekEndingDate,
      status: 'submitted',
      submittedBy: req.body.submittedBy.trim(),
      submittedAt: new Date().toISOString(),
      comments: req.body.comments || null,
      correctionsNotes: req.body.correctionsNotes || null,
      
      // Process entries
      entries: req.body.entries
        .filter(entry => {
          // Only include entries with actual data
          return entry.entryType !== 'hours' || 
                 (entry.hoursWorked && entry.hoursWorked > 0) ||
                 (entry.calculatedHours && entry.calculatedHours > 0);
        })
        .map(processTimesheetEntry),

      // Calculate summary statistics
      summary: {
        totalWorkers: new Set(req.body.entries.map(e => e.candidateId)).size,
        totalHours: req.body.entries.reduce((sum, entry) => {
          if (entry.entryType === 'hours') {
            return sum + (entry.hoursWorked || entry.calculatedHours || 0);
          }
          return sum;
        }, 0),
        workingDays: req.body.entries.filter(e => 
          e.entryType === 'hours' && (e.hoursWorked > 0 || e.calculatedHours > 0)
        ).length,
        sickDays: req.body.entries.filter(e => e.entryType === 'sick').length,
        holidayDays: req.body.entries.filter(e => e.entryType === 'holiday').length,
        absentDays: req.body.entries.filter(e => e.entryType === 'no_show').length
      },

      // Metadata for processing
      metadata: {
        source: 'web_portal',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        processingStatus: 'pending',
        queuedAt: new Date().toISOString()
      }
    };

    // Add to processing queue
    await addToQueue(TIMESHEET_QUEUE_FILE, processedTimesheet);

    // Log successful submission
    console.log('✅ Timesheet queued successfully:', {
      timesheetId,
      clientId: processedTimesheet.clientId,
      weekEndingDate: processedTimesheet.weekEndingDate,
      totalHours: processedTimesheet.summary.totalHours,
      totalWorkers: processedTimesheet.summary.totalWorkers
    });

    // Save to processed file for audit trail
    await addToQueue(PROCESSED_TIMESHEETS_FILE, {
      ...processedTimesheet,
      processedAt: new Date().toISOString()
    });

    // Send success response
    res.json({
      success: true,
      timesheetId,
      message: 'Timesheet submitted successfully',
      summary: processedTimesheet.summary,
      submittedAt: processedTimesheet.submittedAt
    });

    // TODO: Send confirmation email to client
    console.log('📧 TODO: Send confirmation email to client');

  } catch (error) {
    console.error('❌ Timesheet submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to process timesheet submission'
    });
  }
});

// Get timesheet data (for pre-filling forms)
app.get('/api/timesheets/:clientId/:weekEndingDate', async (req, res) => {
  try {
    const { clientId, weekEndingDate } = req.params;

    console.log('📋 Timesheet data request:', { clientId, weekEndingDate });

    // TODO: Get actual timesheet data from DameDesk
    // For now, return mock data structure
    const mockTimesheet = {
      clientId,
      clientName: 'Manufacturing Corp Ltd', // TODO: Get from database
      weekEndingDate,
      status: 'draft',
      assignedCandidates: [
        { id: 'cand1', name: 'John Smith', hourlyRate: 12.50 },
        { id: 'cand2', name: 'Sarah Johnson', hourlyRate: 13.00 },
        { id: 'cand3', name: 'Mike Wilson', hourlyRate: 12.75 },
        { id: 'cand4', name: 'Emma Davis', hourlyRate: 12.50 },
        { id: 'cand5', name: 'Tom Brown', hourlyRate: 13.25 }
      ]
    };

    res.json({
      success: true,
      timesheet: mockTimesheet
    });

  } catch (error) {
    console.error('❌ Error fetching timesheet data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch timesheet data'
    });
  }
});

// Get timesheet queue status (for monitoring)
app.get('/api/timesheets/queue/status', async (req, res) => {
  try {
    const queue = await readQueueFile(TIMESHEET_QUEUE_FILE);
    const processed = await readQueueFile(PROCESSED_TIMESHEETS_FILE);

    res.json({
      success: true,
      queue: {
        pending: queue.length,
        processed: processed.length,
        lastProcessed: processed.length > 0 ? processed[processed.length - 1].processedAt : null
      }
    });
  } catch (error) {
    console.error('❌ Error getting queue status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get queue status'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    service: 'Dame Recruitment Timesheet Bridge',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      submit: 'POST /api/timesheets/submit',
      getData: 'GET /api/timesheets/:clientId/:weekEndingDate',
      queueStatus: 'GET /api/timesheets/queue/status'
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Dame Recruitment Timesheet Bridge Server running on port ${PORT}`);
  console.log(`📋 Timesheet submission endpoint: http://localhost:${PORT}/api/timesheets/submit`);
  console.log(`📊 Queue status endpoint: http://localhost:${PORT}/api/timesheets/queue/status`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
