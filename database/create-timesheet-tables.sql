-- Create timesheets table
CREATE TABLE IF NOT EXISTS timesheets (
    id VARCHAR(255) PRIMARY KEY,
    client_id VARCHAR(255) NOT NULL,
    week_ending_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'submitted',
    submitted_by VARCHAR(255),
    submitted_at TIMESTAMP,
    approved_by VARCHAR(255),
    approved_at TIMESTAMP,
    approval_signature TEXT,
    approval_notes TEXT,
    total_hours DECIMAL(10,2),
    total_workers INTEGER,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create timesheet_entries table
CREATE TABLE IF NOT EXISTS timesheet_entries (
    id VARCHAR(255) PRIMARY KEY,
    timesheet_id VARCHAR(255) NOT NULL,
    worker_name VARCHAR(255) NOT NULL,
    worker_id VARCHAR(255),
    date DATE NOT NULL,
    hours_worked DECIMAL(10,2) NOT NULL,
    hourly_rate DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (timesheet_id) REFERENCES timesheets(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_timesheets_client_id ON timesheets(client_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_status ON timesheets(status);
CREATE INDEX IF NOT EXISTS idx_timesheets_week_ending ON timesheets(week_ending_date);
CREATE INDEX IF NOT EXISTS idx_timesheet_entries_timesheet_id ON timesheet_entries(timesheet_id);
CREATE INDEX IF NOT EXISTS idx_timesheet_entries_worker_id ON timesheet_entries(worker_id);

-- Grant permissions (adjust as needed for your database user)
-- GRANT ALL PRIVILEGES ON timesheets TO your_user;
-- GRANT ALL PRIVILEGES ON timesheet_entries TO your_user;
