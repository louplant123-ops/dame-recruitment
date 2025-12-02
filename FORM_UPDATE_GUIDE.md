# 📝 Form Update Guide - Dame Recruitment

## Quick Reference: How to Add New Fields to Forms

This guide explains how to add new fields to any form and ensure they save to the CRM database.

---

## 🎯 The 3-Step Process

Every form field addition requires changes in **3 places**:

1. **Frontend Form** (React component in `src/app/`)
2. **Backend Function** (Netlify function in `netlify/functions/`)
3. **Database** (Already has the columns - just need to map them)

---

## 📋 Step-by-Step Instructions

### **STEP 1: Add Field to Frontend Form**

#### Location: `src/app/[form-name]/page.tsx`

#### A. Add to State (formData)
```typescript
const [formData, setFormData] = useState({
  // ... existing fields ...
  newFieldName: '',  // ← Add your new field here
})
```

#### B. Add Input Field to JSX
```tsx
<div>
  <label htmlFor="newFieldName" className="block font-body font-medium text-charcoal mb-2">
    New Field Label
  </label>
  <input
    type="text"
    id="newFieldName"
    value={formData.newFieldName}
    onChange={(e) => setFormData({...formData, newFieldName: e.target.value})}
    className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
    placeholder="Optional"
  />
</div>
```

#### C. Add to Pre-fill Logic (if form loads existing data)
```typescript
setFormData({
  // ... existing fields ...
  newFieldName: data.new_field_name || '',  // ← Add here
})
```

---

### **STEP 2: Update Backend Function**

#### Location: `netlify/functions/[function-name].js`

#### A. Add to SQL INSERT/UPDATE Query

**For INSERT queries:**
```javascript
const insertQuery = `
  INSERT INTO contacts (
    id, name, email, phone,
    new_field_name,  -- ← Add column name here
    created_at, updated_at
  ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
`;
```

**For UPDATE queries:**
```javascript
const updateQuery = `
  UPDATE contacts 
  SET 
    name = $1,
    email = $2,
    new_field_name = $3,  -- ← Add column name here
    updated_at = NOW()
  WHERE id = $4
`;
```

#### B. Add to Values Array
```javascript
const values = [
  clientData.name,
  clientData.email,
  clientData.newFieldName || null,  // ← Add here (use camelCase from frontend)
  clientId
];
```

#### C. Add to Data Extraction (if needed)
```javascript
const clientData = {
  name: body.name,
  email: body.email,
  newFieldName: body.newFieldName,  // ← Add here
};
```

---

### **STEP 3: Database Column Mapping**

#### Database Column Names → Frontend Field Names

**Important:** Database uses `snake_case`, Frontend uses `camelCase`

| Database Column | Frontend Field | Example Value |
|----------------|----------------|---------------|
| `company_number` | `companyNumber` | "12345678" |
| `vat_number` | `vatNumber` | "GB123456789" |
| `accounts_contact_name` | `accountsContactName` | "John Smith" |
| `accounts_contact_email` | `accountsContactEmail` | "john@example.com" |
| `accounts_contact_phone` | `accountsContactPhone` | "07123456789" |

---

## 🔍 Form-Specific Examples

### **Example 1: Client Info Form** (`/client-info`)

**Files to modify:**
- Frontend: `src/app/client-info/page.tsx`
- Backend: `netlify/functions/submit-client-info.js`
- Data Loader: `netlify/functions/get-client-info.js`

**Recent changes made:**
```typescript
// Frontend - Added to state
company_number: '',
vat_number: '',
accounts_contact_name: '',
accounts_contact_email: '',
accounts_contact_phone: '',

// Backend - Added to UPDATE query
company_number = $1,
vat_number = $2,
accounts_contact_name = $5,
accounts_contact_email = $6,
accounts_contact_phone = $7,
```

---

### **Example 2: Job Posting Form** (`/post-job`)

**Files to modify:**
- Frontend: `src/app/post-job/page.tsx`
- Backend: `netlify/functions/job-posting.js`

**Recent changes made:**
```typescript
// Frontend - Added to state
companyNumber: '',
vatNumber: '',
accountsContactName: '',
accountsContactEmail: '',
accountsContactPhone: '',

// Backend - Added to INSERT query
INSERT INTO contacts (
  id, name, email, phone, company,
  company_number, vat_number,
  accounts_contact_name, accounts_contact_email, accounts_contact_phone,
  created_at, updated_at
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
```

---

### **Example 3: Candidate Registration** (`/register`)

**Files to modify:**
- Frontend: `src/app/register/page.tsx`
- Backend: `netlify/functions/candidate-registration.js`

**Pattern:**
```typescript
// Frontend
const [formData, setFormData] = useState({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  newField: '',  // ← Add here
})

// Backend
INSERT INTO candidate_registrations (
  id, first_name, last_name, email, phone,
  new_field,  -- ← Add here
  created_at
) VALUES ($1, $2, $3, $4, $5, $6, NOW())
```

---

## 🗄️ Database Tables Reference

### **contacts** (Clients)
Common columns:
- `id`, `name`, `email`, `phone`, `company`
- `company_number`, `vat_number`
- `accounts_contact_name`, `accounts_contact_email`, `accounts_contact_phone`
- `invoice_contact_name`, `invoice_contact_email`
- `ppe_required`, `ppe_details`
- `site_induction_required`, `health_safety_contact`
- `created_at`, `updated_at`

### **candidate_registrations** (Candidates - Part 1)
Common columns:
- `id`, `first_name`, `last_name`, `email`, `phone`
- `postcode`, `address`, `date_of_birth`
- `work_type`, `shift_preference`
- `created_at`, `updated_at`

### **contacts** (Candidates - Part 2 updates this table)
Additional columns:
- `sort_code`, `account_number`, `account_holder_name`
- `ni_number`, `right_to_work_method`, `share_code`
- `emergency_contact_name`, `emergency_contact_phone`, `emergency_contact_relationship`
- `registration_completed_at`

---

## ✅ Testing Checklist

After adding a new field, test:

1. **Frontend Display**
   - [ ] Field appears on the form
   - [ ] Field accepts input
   - [ ] Field validates correctly (if required)

2. **Form Submission**
   - [ ] Form submits without errors
   - [ ] Success message appears

3. **Database Storage**
   - [ ] Check database to confirm value saved
   - [ ] Run query: `SELECT new_field_name FROM contacts WHERE id = 'TEST_ID'`

4. **Data Pre-population** (if applicable)
   - [ ] Reload form with existing data
   - [ ] Confirm new field shows saved value

---

## 🚀 Deployment Process

After making changes:

```bash
# 1. Test locally (if needed)
npm run dev

# 2. Build the site
npm run build

# 3. Commit changes
git add .
git commit -m "Add [field name] to [form name]"

# 4. Push to GitHub
git push

# 5. Wait for Netlify deployment (2-3 minutes)
# Check: https://app.netlify.com

# 6. If changes don't appear, clear cache:
# Netlify Dashboard → Deploys → Trigger deploy → Clear cache and deploy site
```

---

## 🔧 Common Issues & Solutions

### **Issue 1: Field not saving to database**
**Solution:** Check that:
- Column name matches database exactly (use `snake_case`)
- Field is in the SQL query values array
- Field index matches the `$N` placeholder

### **Issue 2: Field not appearing on form**
**Solution:** 
- Clear browser cache
- Trigger Netlify rebuild with cache clear
- Check that `npm run build` completed successfully

### **Issue 3: Field not pre-populating**
**Solution:**
- Check `get-[form-name].js` function includes the field
- Verify field name in `setFormData` matches database column

### **Issue 4: TypeScript errors**
**Solution:**
- Add field to TypeScript interface at top of file
```typescript
interface FormData {
  existingField: string;
  newField: string;  // ← Add here
}
```

---

## 📞 Quick Reference: Form → Function Mapping

| Form URL | Frontend File | Backend Function(s) |
|----------|--------------|---------------------|
| `/register` | `src/app/register/page.tsx` | `candidate-registration.js` |
| `/part2registration` | `src/app/part2registration/page.tsx` | `part2-registration.js` |
| `/post-job` | `src/app/post-job/page.tsx` | `job-posting.js` |
| `/client-info` | `src/app/client-info/page.tsx` | `submit-client-info.js`, `get-client-info.js` |
| `/holiday-request` | `src/app/holiday-request/page.tsx` | `submit-holiday-request.js` |
| `/timesheet` | `src/app/timesheet/page.tsx` | `timesheet-submission.js` |
| `/contract-signing` | `src/app/contract-signing/page.tsx` | `sign-contract.js`, `get-contract.js` |
| `/contact` | `src/app/contact/page.tsx` | `contact-form.js` |

---

## 💡 Pro Tips

1. **Always use consistent naming:**
   - Database: `snake_case` (e.g., `company_number`)
   - Frontend: `camelCase` (e.g., `companyNumber`)

2. **Make fields optional by default:**
   - Use `|| null` in backend values array
   - Don't add `required` attribute unless truly required

3. **Group related fields:**
   - Use sections with headings (e.g., "Company Details", "Accounts Contact")
   - Makes forms easier to understand

4. **Test with real data:**
   - Submit test forms after every change
   - Check database to confirm data saved correctly

5. **Keep backups:**
   - Git commits are your friend
   - Commit before making major changes

---

## 🎓 Learning Resources

- **React Forms:** https://react.dev/learn/sharing-state-between-components
- **PostgreSQL:** https://www.postgresql.org/docs/current/sql-update.html
- **Netlify Functions:** https://docs.netlify.com/functions/overview/

---

**Last Updated:** December 2, 2025
**Maintained By:** Dame Recruitment Development Team
