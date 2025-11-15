# 🚀 Deploy Holiday Request Form - Simple Guide

## Step 1: Run Database Migration

### Connect to your PostgreSQL database and run this SQL:

```sql
-- Create verification_codes table for email verification
CREATE TABLE IF NOT EXISTS verification_codes (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL,
  candidate_id INTEGER REFERENCES contacts(id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_verification_codes_code ON verification_codes(code);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON verification_codes(expires_at);
```

### How to run it:
- **Option A:** Use your database GUI (pgAdmin, DBeaver, etc.)
- **Option B:** Use command line: `psql -U your_user -d your_database -f supabase-migrations/create_verification_codes_table.sql`

---

## Step 2: Deploy to Netlify

### Open terminal and run:

```bash
cd c:/Users/louis/OneDrive/Dame/dame-recruitment-fresh

git add .
git commit -m "Add holiday request form with email verification"
git push origin main
```

### Netlify will automatically:
- Detect the push
- Build the site
- Deploy the new functions
- Go live in ~2-3 minutes

---

## Step 3: Verify Environment Variables

### Go to Netlify Dashboard:
1. https://app.netlify.com
2. Select your site
3. Site settings → Environment variables

### Make sure these exist:
```
DATABASE_URL=your_postgres_connection_string
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM=Dame Recruitment <noreply@damerecruitment.co.uk>
```

**If DATABASE_URL is missing, add it:**
- Format: `postgresql://user:password@host:port/database`
- Example: `postgresql://admin:pass123@db.example.com:5432/dame_crm`

---

## Step 4: Test It!

### Test the external form:
1. Go to: `https://www.damerecruitment.co.uk/holiday-request`
2. Enter a candidate email (one that exists in your CRM)
3. Check email for 6-digit code
4. Enter code
5. Fill out holiday form
6. Submit
7. Check:
   - ✅ Confirmation screen appears
   - ✅ Office receives email notification
   - ✅ Worker receives confirmation email
   - ✅ Request appears in CRM

### Test manual entry in CRM:
1. Open Damedesk CRM
2. Go to any candidate profile
3. Click "Availability" tab
4. Click "🏖️ Request Holiday"
5. Fill and submit
6. Check database for new record

---

## Troubleshooting

### If emails don't send:
- Check Netlify function logs
- Verify SMTP credentials
- Test SMTP connection

### If verification code fails:
- Check DATABASE_URL is correct
- Check verification_codes table exists
- Check candidate email exists in contacts table

### If holiday request doesn't save:
- Check holiday_requests table exists in database
- Check Netlify function logs for errors
- Verify DATABASE_URL connection

---

## What You Built

✅ External holiday request form at `/holiday-request`
✅ Email verification (6-digit code)
✅ Auto-saves to CRM database
✅ Sends notifications to office & worker
✅ Manual entry option in CRM
✅ Shows on schedule with 🏖️ emoji

---

## URLs

- **Production:** https://www.damerecruitment.co.uk/holiday-request
- **Netlify Dashboard:** https://app.netlify.com
- **Your CRM:** Damedesk application

---

**That's it! 3 simple steps and you're live!** 🎉
