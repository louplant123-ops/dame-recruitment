/**
 * GET  /netlify/functions/candidate-holiday   — past & pending holiday requests
 * POST /netlify/functions/candidate-holiday   — submit new holiday request
 *   Body: { startDate, endDate, totalDays, leaveType, reason,
 *           clientApproved?, clientName?, approvedBy?, coverRequired?, additionalNotes? }
 */
const nodemailer = require('nodemailer');
const { getDbClient } = require('./db');
const { validateSession, unauthorised, preflight, jsonResponse } = require('./candidate-auth');

const RAILWAY_URL = process.env.RAILWAY_BACKEND_URL || 'https://damedesk-production.up.railway.app';
const SERVER_API_KEY = process.env.SERVER_API_KEY || '';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();

  const contactId = await validateSession(event.headers?.authorization);
  if (!contactId) return unauthorised();

  const db = getDbClient();
  try {
    await db.connect();

    // ── GET ────────────────────────────────────────────────────────────────
    if (event.httpMethod === 'GET') {
      let rows = [];
      try {
        const result = await db.query(
          `SELECT id, start_date, end_date, total_days, leave_type,
                  reason, status, client_approved, additional_notes, submitted_at
             FROM holiday_requests
            WHERE candidate_id = $1
            ORDER BY submitted_at DESC
            LIMIT 20`,
          [contactId]
        );
        rows = result.rows;
      } catch { /* table may not exist */ }
      await db.end();
      return jsonResponse(200, { requests: rows });
    }

    // ── POST ───────────────────────────────────────────────────────────────
    if (event.httpMethod === 'POST') {
      let body;
      try {
        body = JSON.parse(event.body || '{}');
      } catch {
        await db.end();
        return jsonResponse(400, { error: 'Invalid JSON' });
      }

      const {
        startDate, endDate, totalDays, leaveType, reason,
        clientApproved, clientName, approvedBy,
        coverRequired, additionalNotes,
      } = body;

      if (!startDate || !endDate) {
        await db.end();
        return jsonResponse(400, { error: 'startDate and endDate are required.' });
      }

      const candidateResult = await db.query(
        `SELECT name, email, assigned_to FROM contacts WHERE id = $1`,
        [contactId]
      );
      const candidate = candidateResult.rows[0];
      if (!candidate) {
        await db.end();
        return jsonResponse(404, { error: 'Candidate not found.' });
      }

      const initialStatus = clientApproved ? 'approved' : 'pending';

      const insertResult = await db.query(
        `INSERT INTO holiday_requests
           (candidate_id, start_date, end_date, total_days, leave_type, reason,
            client_approved, client_name, approved_by, status,
            cover_required, additional_notes, submitted_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
         RETURNING id`,
        [
          contactId, startDate, endDate, totalDays || 0, leaveType || 'annual',
          reason || '', clientApproved || false, clientName || null, approvedBy || null,
          initialStatus, coverRequired || false, additionalNotes || null,
        ]
      );

      const holidayId = insertResult.rows[0]?.id;

      // Timeline entry
      try {
        const histId = `HIST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await db.query(
          `INSERT INTO client_history (id, client_id, event_type, event_action, event_date, user_name, description, metadata, created_at)
           VALUES ($1, $2, 'holiday', 'requested', NOW(), $3, $4, $5, NOW())`,
          [
            histId, contactId, candidate.name,
            `Holiday request: ${startDate} to ${endDate} (${totalDays || '?'} days)`,
            JSON.stringify({ holiday_id: holidayId, start_date: startDate, end_date: endDate }),
          ]
        );
      } catch { /* non-critical */ }

      await db.end();

      // Email office
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || 'Dame Recruitment <noreply@damerecruitment.co.uk>',
          to: 'hello@damerecruitment.co.uk',
          subject: `Holiday Request: ${candidate.name} — ${startDate} to ${endDate}`,
          html: buildOfficeEmail(candidate.name, startDate, endDate, totalDays, leaveType, reason, clientApproved, clientName, coverRequired, additionalNotes),
        });
      } catch (mailErr) {
        console.warn('⚠️ Office holiday email failed:', mailErr.message);
      }

      // Email candidate if they have an address
      if (candidate.email) {
        try {
          await transporter.sendMail({
            from: process.env.SMTP_FROM || 'Dame Recruitment <noreply@damerecruitment.co.uk>',
            to: candidate.email,
            subject: 'Holiday Request Received — Dame Recruitment',
            html: buildCandidateEmail(candidate.name, startDate, endDate, totalDays, leaveType, clientApproved, clientName),
          });
        } catch { /* non-critical */ }
      }

      // Notify consultant in Damedesk
      try {
        await fetch(`${RAILWAY_URL}/notifications/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(SERVER_API_KEY ? { 'x-api-key': SERVER_API_KEY } : {}),
          },
          body: JSON.stringify({
            type: 'holiday_request',
            title: 'Holiday Request',
            message: `${candidate.name} has requested holiday: ${startDate} to ${endDate}`,
            icon: 'calendar-outline',
            color: '#8B5CF6',
            linkType: 'contact',
            linkId: contactId,
            assignedTo: candidate.assigned_to,
          }),
        });
      } catch { /* non-critical */ }

      return jsonResponse(200, { success: true, holidayId });
    }

    await db.end();
    return jsonResponse(405, { error: 'Method not allowed' });
  } catch (err) {
    console.error('❌ candidate-holiday error:', err);
    try { await db.end(); } catch { /* ignore */ }
    return jsonResponse(500, { error: 'Internal server error.' });
  }
};

function buildOfficeEmail(name, start, end, days, type, reason, clientApproved, clientName, coverRequired, notes) {
  return `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#333">
<div style="max-width:600px;margin:0 auto;padding:20px">
  <div style="background:#1CA6A3;color:white;padding:24px;border-radius:8px 8px 0 0;text-align:center">
    <h2 style="margin:0">Holiday Request</h2>
  </div>
  <div style="background:#f9fafb;padding:24px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb">
    <p><strong>${name}</strong> has submitted a holiday request via the candidate portal:</p>
    <table style="width:100%;border-collapse:collapse">
      <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;font-weight:600">Dates</td><td style="padding:8px 0;border-bottom:1px solid #e5e7eb">${start} to ${end} (${days || '?'} days)</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;font-weight:600">Type</td><td style="padding:8px 0;border-bottom:1px solid #e5e7eb">${type || 'Annual'}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;font-weight:600">Reason</td><td style="padding:8px 0;border-bottom:1px solid #e5e7eb">${reason || '—'}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;color:#6b7280;font-weight:600">Site approved?</td><td style="padding:8px 0;border-bottom:1px solid #e5e7eb">${clientApproved ? `Yes — ${clientName}` : 'No'}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;font-weight:600">Cover needed?</td><td style="padding:8px 0">${coverRequired ? 'Yes' : 'No'}</td></tr>
      ${notes ? `<tr><td style="padding:8px 0;color:#6b7280;font-weight:600">Notes</td><td style="padding:8px 0">${notes}</td></tr>` : ''}
    </table>
    <p style="margin-top:20px">Please review this request in Damedesk.</p>
  </div>
</div></body></html>`;
}

function buildCandidateEmail(name, start, end, days, type, clientApproved, clientName) {
  const firstName = (name || '').split(' ')[0];
  return `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#333">
<div style="max-width:600px;margin:0 auto;padding:20px">
  <div style="background:#C8102E;color:white;padding:24px;border-radius:8px 8px 0 0;text-align:center">
    <h2 style="margin:0">Dame Recruitment</h2>
  </div>
  <div style="background:#f9fafb;padding:24px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb">
    <p>Hi ${firstName},</p>
    <p>Your holiday request has been received and is under review.</p>
    <div style="background:white;border:1px solid #e5e7eb;border-radius:6px;padding:16px;margin:16px 0">
      <p style="margin:0 0 8px"><strong>${start}</strong> to <strong>${end}</strong> (${days || '?'} days)</p>
      <p style="margin:0;color:#6b7280;font-size:14px">${type || 'Annual Leave'}${clientApproved ? ` · Site approved by ${clientName}` : ''}</p>
    </div>
    <p>We'll be in touch within 24 hours to confirm.</p>
    <p style="margin-top:24px;color:#6b7280;font-size:14px">Dame Recruitment · hello@damerecruitment.co.uk · 0330 043 5011</p>
  </div>
</div></body></html>`;
}
