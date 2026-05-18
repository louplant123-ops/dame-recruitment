/**
 * GET  /netlify/functions/candidate-perm-checklist  — checklist + placement info
 * POST /netlify/functions/candidate-perm-checklist  — mark a step complete
 *   Body: { stepKey: string, placementId?: string }
 */
const { getDbClient } = require('./db');
const { validateSession, unauthorised, preflight, jsonResponse } = require('./candidate-auth');

const RAILWAY_URL = process.env.RAILWAY_BACKEND_URL || 'https://damedesk-production.up.railway.app';
const SERVER_API_KEY = process.env.SERVER_API_KEY || '';

const DEFAULT_STEPS = [
  { key: 'offer_accepted',     label: 'Offer Accepted',              description: 'You have confirmed acceptance of the job offer.' },
  { key: 'contract_signed',    label: 'Contract / Offer Letter Signed', description: 'Sign and return your employment contract.' },
  { key: 'rtw_uploaded',       label: 'Right to Work Verified',      description: 'Upload your share code or passport via the Documents tab.' },
  { key: 'start_details',      label: 'Day 1 Details Confirmed',     description: 'You know where to go, who to ask for, and what to wear.' },
  { key: 'references_provided',label: 'References Provided',         description: 'At least two employment references submitted.' },
  { key: 'started',            label: 'Started Role',                description: 'First day confirmed — welcome to the new job!' },
];

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();

  const contactId = await validateSession(event.headers?.authorization);
  if (!contactId) return unauthorised();

  const db = getDbClient();
  try {
    await db.connect();

    // Get active perm placement
    const placementResult = await db.query(
      `SELECT cp.id, cp.status, cp.start_date,
              cl.name AS client_name,
              j.title AS job_title
         FROM client_placements cp
         LEFT JOIN contacts cl ON cl.id = cp.client_id
         LEFT JOIN jobs j ON j.id = cp.job_id
        WHERE cp.candidate_id = $1
          AND cp.placement_type = 'perm'
          AND cp.status IN ('confirmed', 'active', 'placed', 'current', 'offer_made')
        ORDER BY cp.start_date DESC
        LIMIT 1`,
      [contactId]
    );

    const placement = placementResult.rows[0] || null;
    const placementId = placement?.id || 'none';

    // ── GET ────────────────────────────────────────────────────────────────
    if (event.httpMethod === 'GET') {
      let completedSteps = {};
      try {
        const checklistResult = await db.query(
          `SELECT step_key, completed, completed_at
             FROM perm_milestone_checklist
            WHERE contact_id = $1 AND placement_id = $2`,
          [contactId, placementId]
        );
        completedSteps = Object.fromEntries(
          checklistResult.rows.map(r => [r.step_key, { completed: r.completed, completedAt: r.completed_at }])
        );
      } catch { /* table may not exist yet */ }

      // Auto-detect certain steps from the DB
      if (!completedSteps.offer_accepted) {
        completedSteps.offer_accepted = { completed: !!placement, completedAt: null };
      }
      if (!completedSteps.started && placement?.status === 'active') {
        completedSteps.started = { completed: true, completedAt: null };
      }

      const steps = DEFAULT_STEPS.map(s => ({
        ...s,
        completed: completedSteps[s.key]?.completed || false,
        completedAt: completedSteps[s.key]?.completedAt || null,
      }));

      await db.end();
      return jsonResponse(200, { placement, steps });
    }

    // ── POST: mark step complete ───────────────────────────────────────────
    if (event.httpMethod === 'POST') {
      let body;
      try {
        body = JSON.parse(event.body || '{}');
      } catch {
        await db.end();
        return jsonResponse(400, { error: 'Invalid JSON' });
      }

      const { stepKey } = body;
      if (!stepKey || !DEFAULT_STEPS.find(s => s.key === stepKey)) {
        await db.end();
        return jsonResponse(400, { error: 'Valid stepKey is required.' });
      }

      const stepLabel = DEFAULT_STEPS.find(s => s.key === stepKey)?.label || stepKey;

      await db.query(
        `INSERT INTO perm_milestone_checklist
           (contact_id, placement_id, step_key, step_label, completed, completed_at)
         VALUES ($1, $2, $3, $4, TRUE, NOW())
         ON CONFLICT (contact_id, placement_id, step_key)
         DO UPDATE SET completed = TRUE, completed_at = NOW()`,
        [contactId, placementId, stepKey, stepLabel]
      );

      // Log activity
      try {
        await db.query(
          `INSERT INTO activity_log (contact_id, type, description, created_at)
           VALUES ($1, 'perm_milestone', $2, NOW())`,
          [contactId, `Completed perm checklist step: ${stepLabel} via portal`]
        );
      } catch { /* non-critical */ }

      // Notify consultant
      try {
        const nameRes = await db.query(`SELECT name, assigned_to FROM contacts WHERE id = $1`, [contactId]);
        const candidateName = nameRes.rows[0]?.name || 'Candidate';
        const assignedTo = nameRes.rows[0]?.assigned_to;
        await fetch(`${RAILWAY_URL}/notifications/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(SERVER_API_KEY ? { 'x-api-key': SERVER_API_KEY } : {}),
          },
          body: JSON.stringify({
            type: 'perm_milestone_completed',
            title: 'Pre-Start Checklist Update',
            message: `${candidateName} completed: ${stepLabel}`,
            icon: 'checkmark-circle-outline',
            color: '#10B981',
            linkType: 'contact',
            linkId: contactId,
            assignedTo,
          }),
        });
      } catch { /* non-critical */ }

      await db.end();
      return jsonResponse(200, { success: true });
    }

    await db.end();
    return jsonResponse(405, { error: 'Method not allowed' });
  } catch (err) {
    console.error('❌ candidate-perm-checklist error:', err);
    try { await db.end(); } catch { /* ignore */ }
    return jsonResponse(500, { error: 'Internal server error.' });
  }
};
