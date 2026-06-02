// Shared persistence for website client registration forms.
// Maps form payloads into structured `contacts` columns (CompanyTab-ready) and
// detail rows in client_registrations / direct_employment_registrations.

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function asArray(v) {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string' && v.length) {
    try {
      const p = JSON.parse(v);
      if (Array.isArray(p)) return p;
    } catch { /* plain string */ }
    return [v];
  }
  return [];
}

function salaryLabel(d) {
  const min = d.salaryMin ? `£${d.salaryMin}` : null;
  const max = d.salaryMax ? `£${d.salaryMax}` : null;
  const range = min && max ? `${min}–${max}` : (min || max || null);
  return range ? `${range}${d.salaryType ? ` (${d.salaryType})` : ''}` : null;
}

function buildTempClientNotes(d) {
  const roleTypes = asArray(d.roleTypes);
  const shiftTypes = asArray(d.shiftTypes);
  return [
    `Temp client registration — ${d.companyName}`,
    d.jobTitle ? `Contact role: ${d.jobTitle}` : null,
    d.industry ? `Industry: ${d.industry}` : null,
    d.companySize ? `Company size: ${d.companySize}` : null,
    d.website ? `Website: ${d.website}` : null,
    roleTypes.length ? `Role types: ${roleTypes.join(', ')}` : null,
    shiftTypes.length ? `Shift types: ${shiftTypes.join(', ')}` : null,
    d.numberOfStaff ? `Workers needed: ${d.numberOfStaff}` : null,
    d.urgency ? `Urgency: ${d.urgency}` : null,
    (d.startTime || d.endTime) ? `Shift window: ${d.startTime || '?'}–${d.endTime || '?'}` : null,
    d.hourlyRate ? `Budget/rate: ${d.hourlyRate}` : null,
    d.paymentTerms ? `Payment terms: ${d.paymentTerms}` : null,
    d.multipleLocations ? `Multiple locations: ${d.multipleLocations}` : null,
    d.requirements ? `Requirements: ${d.requirements}` : null,
    d.healthSafety ? `H&S: ${d.healthSafety}` : null,
    d.additionalInfo ? `Additional: ${d.additionalInfo}` : null,
  ].filter(Boolean).join('\n');
}

function buildDirectEmploymentNotes(d) {
  const benefits = asArray(d.benefits);
  return [
    `Direct employment registration — ${d.companyName}`,
    d.contactJobTitle ? `Contact role: ${d.contactJobTitle}` : null,
    d.industry ? `Industry: ${d.industry}` : null,
    d.companySize ? `Company size: ${d.companySize}` : null,
    d.website ? `Website: ${d.website}` : null,
    d.companyDescription ? `About: ${d.companyDescription}` : null,
    `Role: ${d.roleTitle || d.jobTitle || 'N/A'}${d.department ? ` (${d.department})` : ''}`,
    d.seniority ? `Seniority: ${d.seniority}` : null,
    d.employmentType ? `Employment type: ${d.employmentType}` : null,
    salaryLabel(d) ? `Salary: ${salaryLabel(d)}` : null,
    d.bonus ? `Bonus: ${d.bonus}` : null,
    benefits.length ? `Benefits: ${benefits.join(', ')}` : null,
    (d.workLocation || d.postcode) ? `Location: ${d.workLocation || ''}${d.postcode ? ` ${d.postcode}` : ''}` : null,
    d.workArrangement ? `Arrangement: ${d.workArrangement}` : null,
    d.urgency ? `Urgency: ${d.urgency}` : null,
    d.startDate ? `Target start: ${d.startDate}` : null,
    d.interviewProcess ? `Interview process: ${d.interviewProcess}` : null,
    d.backgroundChecks ? `Background checks: ${d.backgroundChecks}` : null,
    d.jobDescription ? `\nJob description:\n${d.jobDescription}` : null,
    d.requiredSkills ? `\nRequired skills:\n${d.requiredSkills}` : null,
    d.preferredSkills ? `\nPreferred skills:\n${d.preferredSkills}` : null,
    d.companyCulture ? `\nCulture:\n${d.companyCulture}` : null,
    d.teamStructure ? `\nTeam:\n${d.teamStructure}` : null,
    d.additionalRequirements ? `\nAdditional:\n${d.additionalRequirements}` : null,
  ].filter(Boolean).join('\n');
}

function mapTempClientContactFields(d, notes) {
  const roleTypes = asArray(d.roleTypes);
  const shiftTypes = asArray(d.shiftTypes);
  const workingHours = (d.startTime || d.endTime) ? `${d.startTime || '?'}–${d.endTime || '?'}` : null;
  return {
    name: d.contactName,
    email: d.email || null,
    phone: d.phone || null,
    company: d.companyName,
    company_name: d.companyName,
    contact_name: d.contactName,
    job_title: d.jobTitle || null,
    type: 'client',
    status: 'active',
    temperature: 'hot',
    company_number: d.companyNumber || null,
    vat_number: d.vatNumber || null,
    accounts_contact_name: d.accountsContactName || null,
    accounts_contact_email: d.accountsContactEmail || null,
    accounts_contact_phone: d.accountsContactPhone || null,
    address: d.address || null,
    postcode: d.postcode || null,
    location: d.address || null,
    industry: d.industry || null,
    company_size: d.companySize || null,
    website: d.website || null,
    payment_terms: d.paymentTerms || null,
    urgency_level: d.urgency || null,
    recruitment_type: 'temp',
    hiring_volume: d.numberOfStaff ? String(d.numberOfStaff) : null,
    typical_roles: roleTypes.length ? JSON.stringify(roleTypes) : null,
    shift_availability: shiftTypes.length ? shiftTypes.join(', ') : null,
    working_hours: workingHours,
    temp_markup: d.hourlyRate || null,
    special_requirements: d.requirements || null,
    health_safety_contact: d.healthSafety || null,
    recruitment_needs_summary: d.additionalInfo || null,
    recruiting_for_role: roleTypes.length ? roleTypes.join(', ') : null,
    notes,
  };
}

function mapDirectEmploymentContactFields(d, notes) {
  const benefits = asArray(d.benefits);
  const skillsBlock = [d.requiredSkills, d.preferredSkills].filter(Boolean).join('\n\n');
  return {
    name: d.contactName,
    email: d.email || null,
    phone: d.phone || null,
    company: d.companyName,
    company_name: d.companyName,
    contact_name: d.contactName,
    job_title: d.contactJobTitle || null,
    department: d.department || null,
    type: 'client',
    status: 'active',
    temperature: 'hot',
    company_number: d.companyNumber || null,
    vat_number: d.vatNumber || null,
    accounts_contact_name: d.accountsContactName || null,
    accounts_contact_email: d.accountsContactEmail || null,
    accounts_contact_phone: d.accountsContactPhone || null,
    postcode: d.postcode || null,
    location: d.workLocation || null,
    industry: d.industry || null,
    company_size: d.companySize || null,
    website: d.website || null,
    description: d.companyDescription || null,
    recruitment_type: 'perm',
    urgency_level: d.urgency || null,
    recruiting_for_role: d.roleTitle || d.jobTitle || null,
    salary_ranges: salaryLabel(d),
    interview_process: d.interviewProcess || null,
    preferred_start_dates: d.startDate || null,
    special_requirements: skillsBlock || d.additionalRequirements || null,
    recruitment_needs_summary: d.jobDescription || null,
    services_description: d.companyCulture || null,
    notes,
  };
}

async function findContactIdByEmail(client, email) {
  if (!email) return null;
  const existing = await client.query(
    `SELECT id FROM contacts WHERE LOWER(email) = LOWER($1) LIMIT 1`,
    [email]
  );
  return existing.rows[0]?.id || null;
}

async function upsertStructuredContact(client, fields, source) {
  const existingId = await findContactIdByEmail(client, fields.email);
  const contactId = existingId || createId('CLIENT');

  if (existingId) {
    await client.query(
      `UPDATE contacts SET
         name = $2, email = $3, phone = COALESCE($4, phone), company = $5, company_name = $5,
         contact_name = $6, job_title = COALESCE($7, job_title), type = 'client', status = 'active',
         temperature = 'hot', company_number = COALESCE($8, company_number),
         vat_number = COALESCE($9, vat_number),
         accounts_contact_name = COALESCE($10, accounts_contact_name),
         accounts_contact_email = COALESCE($11, accounts_contact_email),
         accounts_contact_phone = COALESCE($12, accounts_contact_phone),
         address = COALESCE($13, address), postcode = COALESCE($14, postcode),
         location = COALESCE($15, location), industry = COALESCE($16, industry),
         company_size = COALESCE($17, company_size), website = COALESCE($18, website),
         payment_terms = COALESCE($19, payment_terms), urgency_level = COALESCE($20, urgency_level),
         recruitment_type = COALESCE($21, recruitment_type),
         hiring_volume = COALESCE($22, hiring_volume),
         typical_roles = COALESCE($23, typical_roles),
         shift_availability = COALESCE($24, shift_availability),
         working_hours = COALESCE($25, working_hours),
         temp_markup = COALESCE($26, temp_markup),
         special_requirements = COALESCE($27, special_requirements),
         health_safety_contact = COALESCE($28, health_safety_contact),
         recruitment_needs_summary = COALESCE($29, recruitment_needs_summary),
         recruiting_for_role = COALESCE($30, recruiting_for_role),
         department = COALESCE($31, department),
         description = COALESCE($32, description),
         salary_ranges = COALESCE($33, salary_ranges),
         interview_process = COALESCE($34, interview_process),
         preferred_start_dates = COALESCE($35, preferred_start_dates),
         services_description = COALESCE($36, services_description),
         notes = CASE WHEN COALESCE(notes, '') = '' THEN $37
                      ELSE notes || E'\n\n--- Updated ' || TO_CHAR(NOW(),'YYYY-MM-DD HH24:MI') || E' ---\n' || $37 END,
         source = $38, last_contact = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [
        contactId, fields.name, fields.email, fields.phone, fields.company, fields.contact_name,
        fields.job_title, fields.company_number, fields.vat_number,
        fields.accounts_contact_name, fields.accounts_contact_email, fields.accounts_contact_phone,
        fields.address, fields.postcode, fields.location, fields.industry, fields.company_size,
        fields.website, fields.payment_terms, fields.urgency_level, fields.recruitment_type,
        fields.hiring_volume, fields.typical_roles, fields.shift_availability, fields.working_hours,
        fields.temp_markup, fields.special_requirements, fields.health_safety_contact,
        fields.recruitment_needs_summary, fields.recruiting_for_role, fields.department,
        fields.description, fields.salary_ranges, fields.interview_process,
        fields.preferred_start_dates, fields.services_description, fields.notes, source,
      ]
    );
    return contactId;
  }

  await client.query(
    `INSERT INTO contacts (
       id, name, email, phone, company, company_name, contact_name, job_title, type, status, temperature,
       company_number, vat_number, accounts_contact_name, accounts_contact_email, accounts_contact_phone,
       address, postcode, location, industry, company_size, website, payment_terms, urgency_level,
       recruitment_type, hiring_volume, typical_roles, shift_availability, working_hours, temp_markup,
       special_requirements, health_safety_contact, recruitment_needs_summary, recruiting_for_role,
       department, description, salary_ranges, interview_process, preferred_start_dates,
       services_description, notes, source, last_contact, created_at, updated_at
     ) VALUES (
       $1,$2,$3,$4,$5,$5,$6,$7,'client','active','hot',$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
       $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,NOW(),NOW(),NOW()
     )`,
    [
      contactId, fields.name, fields.email, fields.phone, fields.company, fields.contact_name,
      fields.job_title, fields.company_number, fields.vat_number,
      fields.accounts_contact_name, fields.accounts_contact_email, fields.accounts_contact_phone,
      fields.address, fields.postcode, fields.location, fields.industry, fields.company_size,
      fields.website, fields.payment_terms, fields.urgency_level, fields.recruitment_type,
      fields.hiring_volume, fields.typical_roles, fields.shift_availability, fields.working_hours,
      fields.temp_markup, fields.special_requirements, fields.health_safety_contact,
      fields.recruitment_needs_summary, fields.recruiting_for_role, fields.department,
      fields.description, fields.salary_ranges, fields.interview_process,
      fields.preferred_start_dates, fields.services_description, fields.notes, source,
    ]
  );
  return contactId;
}

async function upsertTempClientRegistration(client, contactId, d, source) {
  const roleTypes = asArray(d.roleTypes);
  const shiftTypes = asArray(d.shiftTypes);
  const regId = createId('CREG');
  await client.query(
    `INSERT INTO client_registrations (
       id, contact_id, company_name, contact_name, contact_job_title, email, phone, industry, company_size,
       website, company_number, vat_number, address, postcode,
       accounts_contact_name, accounts_contact_email, accounts_contact_phone,
       urgency, role_types, shift_types, hourly_rate, payment_terms, number_of_staff,
       start_time, end_time, multiple_locations, requirements, health_safety, additional_info,
       status, processed, source, raw_payload, created_at, updated_at
     ) VALUES (
       $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,
       'new_inquiry', false, $30, $31, NOW(), NOW()
     )
     ON CONFLICT (contact_id) DO UPDATE SET
       company_name = EXCLUDED.company_name, contact_name = EXCLUDED.contact_name,
       contact_job_title = EXCLUDED.contact_job_title, phone = EXCLUDED.phone,
       industry = EXCLUDED.industry, company_size = EXCLUDED.company_size, website = EXCLUDED.website,
       company_number = EXCLUDED.company_number, vat_number = EXCLUDED.vat_number,
       address = EXCLUDED.address, postcode = EXCLUDED.postcode,
       accounts_contact_name = EXCLUDED.accounts_contact_name,
       accounts_contact_email = EXCLUDED.accounts_contact_email,
       accounts_contact_phone = EXCLUDED.accounts_contact_phone,
       urgency = EXCLUDED.urgency, role_types = EXCLUDED.role_types, shift_types = EXCLUDED.shift_types,
       hourly_rate = EXCLUDED.hourly_rate, payment_terms = EXCLUDED.payment_terms,
       number_of_staff = EXCLUDED.number_of_staff, start_time = EXCLUDED.start_time,
       end_time = EXCLUDED.end_time, multiple_locations = EXCLUDED.multiple_locations,
       requirements = EXCLUDED.requirements, health_safety = EXCLUDED.health_safety,
       additional_info = EXCLUDED.additional_info, source = EXCLUDED.source,
       raw_payload = EXCLUDED.raw_payload, updated_at = NOW()`,
    [
      regId, contactId, d.companyName, d.contactName, d.jobTitle || null, d.email || null, d.phone || null,
      d.industry || null, d.companySize || null, d.website || null, d.companyNumber || null, d.vatNumber || null,
      d.address || null, d.postcode || null, d.accountsContactName || null, d.accountsContactEmail || null,
      d.accountsContactPhone || null, d.urgency || null, JSON.stringify(roleTypes), JSON.stringify(shiftTypes),
      d.hourlyRate || null, d.paymentTerms || null,
      d.numberOfStaff ? parseInt(d.numberOfStaff, 10) || null : null,
      d.startTime || null, d.endTime || null, d.multipleLocations || null,
      d.requirements || null, d.healthSafety || null, d.additionalInfo || null,
      source, JSON.stringify(d),
    ]
  );
}

async function upsertDirectEmploymentRegistration(client, contactId, d, source) {
  const benefits = asArray(d.benefits);
  const regId = createId('DREG');
  await client.query(
    `INSERT INTO direct_employment_registrations (
       id, contact_id, company_name, contact_name, contact_job_title, email, phone, industry, company_size,
       website, company_description, company_number, vat_number,
       accounts_contact_name, accounts_contact_email, accounts_contact_phone,
       role_title, department, seniority, employment_type, job_description, required_skills, preferred_skills,
       salary_min, salary_max, salary_type, bonus, benefits, work_location, postcode, work_arrangement,
       company_culture, team_structure, urgency, start_date, interview_process, background_checks,
       additional_requirements, status, processed, source, raw_payload, created_at, updated_at
     ) VALUES (
       $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,
       $29,$30,$31,$32,$33,$34,$35,$36,$37,$38,'new_inquiry', false, $39, $40, NOW(), NOW()
     )
     ON CONFLICT (contact_id) DO UPDATE SET
       company_name = EXCLUDED.company_name, contact_name = EXCLUDED.contact_name,
       contact_job_title = EXCLUDED.contact_job_title, phone = EXCLUDED.phone,
       industry = EXCLUDED.industry, company_size = EXCLUDED.company_size, website = EXCLUDED.website,
       company_description = EXCLUDED.company_description, company_number = EXCLUDED.company_number,
       vat_number = EXCLUDED.vat_number, accounts_contact_name = EXCLUDED.accounts_contact_name,
       accounts_contact_email = EXCLUDED.accounts_contact_email,
       accounts_contact_phone = EXCLUDED.accounts_contact_phone, role_title = EXCLUDED.role_title,
       department = EXCLUDED.department, seniority = EXCLUDED.seniority,
       employment_type = EXCLUDED.employment_type, job_description = EXCLUDED.job_description,
       required_skills = EXCLUDED.required_skills, preferred_skills = EXCLUDED.preferred_skills,
       salary_min = EXCLUDED.salary_min, salary_max = EXCLUDED.salary_max, salary_type = EXCLUDED.salary_type,
       bonus = EXCLUDED.bonus, benefits = EXCLUDED.benefits, work_location = EXCLUDED.work_location,
       postcode = EXCLUDED.postcode, work_arrangement = EXCLUDED.work_arrangement,
       company_culture = EXCLUDED.company_culture, team_structure = EXCLUDED.team_structure,
       urgency = EXCLUDED.urgency, start_date = EXCLUDED.start_date,
       interview_process = EXCLUDED.interview_process, background_checks = EXCLUDED.background_checks,
       additional_requirements = EXCLUDED.additional_requirements, source = EXCLUDED.source,
       raw_payload = EXCLUDED.raw_payload, updated_at = NOW()`,
    [
      regId, contactId, d.companyName, d.contactName, d.contactJobTitle || null, d.email || null, d.phone || null,
      d.industry || null, d.companySize || null, d.website || null, d.companyDescription || null,
      d.companyNumber || null, d.vatNumber || null, d.accountsContactName || null, d.accountsContactEmail || null,
      d.accountsContactPhone || null, d.roleTitle || d.jobTitle || null, d.department || null, d.seniority || null,
      d.employmentType || null, d.jobDescription || null, d.requiredSkills || null, d.preferredSkills || null,
      d.salaryMin || null, d.salaryMax || null, d.salaryType || null, d.bonus || null, JSON.stringify(benefits),
      d.workLocation || null, d.postcode || null, d.workArrangement || null, d.companyCulture || null,
      d.teamStructure || null, d.urgency || null, d.startDate || null, d.interviewProcess || null,
      d.backgroundChecks || null, d.additionalRequirements || null, source, JSON.stringify(d),
    ]
  );
}

async function insertRegistrationActivity(client, contactId, summary, payload) {
  await client.query(
    `INSERT INTO activities (id, subject_type, subject_id, type, summary, channel, direction, user_name, details, created_at)
     VALUES ($1, 'client', $2, 'registration', $3, 'web', 'inbound', 'Website', $4, NOW())`,
    [createId('act'), contactId, summary, JSON.stringify(payload)]
  );
}

async function insertFollowUpTask(client, contactId, title, description) {
  await client.query(
    `INSERT INTO tasks (id, title, description, type, priority, status, assigned_to, contact_id, due_date, created_at, updated_at)
     VALUES ($1, $2, $3, 'client_followup', 'high', 'pending', NULL, $4, NOW() + INTERVAL '24 hours', NOW(), NOW())`,
    [createId('task'), title, description, contactId]
  );
}

module.exports = {
  createId,
  buildTempClientNotes,
  buildDirectEmploymentNotes,
  mapTempClientContactFields,
  mapDirectEmploymentContactFields,
  upsertStructuredContact,
  upsertTempClientRegistration,
  upsertDirectEmploymentRegistration,
  insertRegistrationActivity,
  insertFollowUpTask,
};
