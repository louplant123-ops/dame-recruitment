# Holiday Request System Setup

## Overview
Workers can now submit holiday requests via a self-service form without needing to contact the office.

## How It Works

### For Workers:
1. Go to: `https://www.damerecruitment.co.uk/holiday-request`
2. Enter their email address
3. Receive a 6-digit verification code via email
4. Enter the code to verify identity
5. Fill out holiday request form
6. Submit → Request goes to CRM

### For Consultants (Manual Entry):
1. Open candidate profile in CRM
2. Go to "Availability" tab
3. Click "🏖️ Request Holiday" button
4. Fill in holiday details
5. Submit → Saves to database and sends notifications

## Setup Instructions

### 1. Database Migration
Run the SQL migration to create the verification_codes table:

```bash
# In Supabase dashboard, run:
supabase-migrations/create_verification_codes_table.sql
```

Or manually create the table:
```sql
CREATE TABLE verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL,
  candidate_id UUID REFERENCES contacts(id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE
);
```

### 2. Environment Variables
Ensure these are set in Netlify:

```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM=Dame Recruitment <noreply@damerecruitment.co.uk>
```

### 3. Deploy
Deploy the website to Netlify:

```bash
cd dame-recruitment-fresh
npm run build
# Or push to git and let Netlify auto-deploy
```

## Files Created

### External Form:
- `src/app/holiday-request/page.tsx` - Worker-facing holiday request form

### Netlify Functions:
- `netlify/functions/send-holiday-verification.js` - Sends verification code
- `netlify/functions/verify-holiday-code.js` - Verifies code and returns candidate data
- `netlify/functions/submit-holiday-request.js` - Submits holiday request to database

### CRM Integration:
- Already exists: `HolidayRequestForm.tsx` - Manual entry form for consultants
- Already exists: Availability tab with "Request Holiday" button

## Email Flow

### Verification Email:
```
Subject: Your Holiday Request Verification Code

Hi [Name],

Your verification code is: 123456

This code expires in 10 minutes.
```

### Office Notification:
```
Subject: Holiday Request: [Name] - [Start] to [End]

[Name] has submitted a holiday request:
- Dates: [Start] to [End]
- Total Days: X
- Type: Annual Leave
- Reason: [Reason]
- Client Approved: Yes/No
```

### Candidate Confirmation:
```
Subject: Holiday Request Received

Hi [Name],

Your holiday request has been received:
- Dates: [Start] to [End]
- Total Days: X

We'll review and confirm within 24 hours.
```

## Testing

### Test External Form:
1. Go to: `http://localhost:8888/holiday-request` (dev) or live URL
2. Enter a candidate email from your database
3. Check email for verification code
4. Enter code and submit holiday request
5. Check CRM for new holiday request
6. Check email for notifications

### Test Manual Entry:
1. Open CRM
2. Go to any candidate profile
3. Click Availability tab
4. Click "🏖️ Request Holiday"
5. Fill form and submit
6. Check database for new record
7. Check email for notifications

## Database Schema

### holiday_requests table:
```sql
- id (UUID)
- candidate_id (UUID) → links to contacts
- start_date (DATE)
- end_date (DATE)
- total_days (INTEGER)
- leave_type (TEXT) - 'annual', 'unpaid', 'sick', 'emergency'
- reason (TEXT)
- client_approved (BOOLEAN)
- client_name (TEXT)
- approved_by (TEXT)
- status (TEXT) - 'pending', 'approved', 'rejected'
- submitted_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

### verification_codes table:
```sql
- id (UUID)
- email (TEXT)
- code (TEXT) - 6-digit code
- type (TEXT) - 'holiday_request'
- candidate_id (UUID)
- expires_at (TIMESTAMP) - 10 minutes from creation
- created_at (TIMESTAMP)
- used_at (TIMESTAMP)
```

## Security Features

1. **Email Verification**: Only candidates with registered emails can submit
2. **Time-Limited Codes**: Verification codes expire after 10 minutes
3. **One-Time Use**: Codes are deleted after successful verification
4. **Candidate Matching**: Email must match a candidate in the database
5. **Type Filtering**: Only candidates (not clients/prospects) can submit

## Workflow

```
Worker Submits Holiday
       ↓
Email Verification
       ↓
Code Validated
       ↓
Form Pre-Filled with Worker Data
       ↓
Worker Fills Dates/Reason
       ↓
Submits to Database
       ↓
Emails Sent:
  - Office notification
  - Worker confirmation
       ↓
Shows in CRM:
  - Availability tab
  - Schedule page (red blocks)
  - Holiday requests list
```

## Future Enhancements

- [ ] SMS verification option
- [ ] Holiday allowance tracking
- [ ] Automatic approval for certain conditions
- [ ] Client notification if worker on assignment
- [ ] Integration with payroll system
- [ ] Mobile app support

## Support

If workers have issues:
1. Check their email is registered in CRM
2. Check they're marked as type='candidate'
3. Check SMTP settings are correct
4. Check Supabase connection
5. Check Netlify function logs

## URLs

- **Production**: https://www.damerecruitment.co.uk/holiday-request
- **Development**: http://localhost:8888/holiday-request
