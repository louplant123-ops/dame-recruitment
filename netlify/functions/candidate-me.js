/**
 * GET /netlify/functions/candidate-me
 * Authorization: Bearer <token>
 *
 * Returns full candidate profile plus current placement context:
 * registrationType ('temp'|'perm'), active placement, assigned consultant.
 */
const { getDbClient } = require('./db');
const { validateSession, unauthorised, preflight, jsonResponse } = require('./candidate-auth');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();
  if (event.httpMethod !== 'GET') return jsonResponse(405, { error: 'Method not allowed' });

  const contactId = await validateSession(event.headers?.authorization);
  if (!contactId) return unauthorised();

  const db = getDbClient();
  try {
    await db.connect();

    const candidateResult = await db.query(
      `SELECT
         c.id, c.name, c.email, c.phone,
         c.registration_type,
         c.right_to_work, c.visa_expiry,
         c.address, c.postcode,
         c.assigned_to,
         con.name AS consultant_name,
         con.email AS consultant_email,
         con.phone AS consultant_phone
       FROM contacts c
       LEFT JOIN contacts con ON con.id = c.assigned_to AND con.type = 'consultant'
       WHERE c.id = $1`,
      [contactId]
    );

    if (candidateResult.rows.length === 0) {
      await db.end();
      return jsonResponse(404, { error: 'Candidate not found.' });
    }

    const candidate = candidateResult.rows[0];

    // Active placement
    const placementResult = await db.query(
      `SELECT
         cp.id, cp.status, cp.start_date, cp.end_date,
         cp.placement_type,
         cl.name AS client_name, cl.id AS client_id,
         j.title AS job_title
       FROM client_placements cp
       LEFT JOIN contacts cl ON cl.id = cp.client_id
       LEFT JOIN jobs j ON j.id = cp.job_id
       WHERE cp.candidate_id = $1
         AND cp.status IN ('active', 'confirmed', 'placed', 'current')
       ORDER BY cp.start_date DESC
       LIMIT 1`,
      [contactId]
    );

    const placement = placementResult.rows[0] || null;

    // Registration progress (how many steps completed for unplaced candidates)
    const regSteps = await getRegistrationProgress(db, contactId);

    // Upcoming shifts count (next 14 days)
    let upcomingShifts = 0;
    try {
      const shiftCount = await db.query(
        `SELECT COUNT(*) FROM shifts
          WHERE candidate_id = $1
            AND shift_date >= CURRENT_DATE
            AND shift_date <= CURRENT_DATE + INTERVAL '14 days'
            AND status NOT IN ('cancelled', 'no_show')`,
        [contactId]
      );
      upcomingShifts = parseInt(shiftCount.rows[0]?.count || '0', 10);
    } catch { /* shifts table may have different schema */ }

    // Pending holiday requests
    let pendingHolidays = 0;
    try {
      const holidayCount = await db.query(
        `SELECT COUNT(*) FROM holiday_requests
          WHERE candidate_id = $1 AND status = 'pending'`,
        [contactId]
      );
      pendingHolidays = parseInt(holidayCount.rows[0]?.count || '0', 10);
    } catch { /* non-critical */ }

    await db.end();

    return jsonResponse(200, {
      candidate: {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        registrationType: candidate.registration_type || 'temp',
        rightToWork: candidate.right_to_work,
        visaExpiry: candidate.visa_expiry,
      },
      consultant: candidate.consultant_name ? {
        name: candidate.consultant_name,
        email: candidate.consultant_email,
        phone: candidate.consultant_phone,
      } : null,
      placement,
      registrationProgress: regSteps,
      stats: {
        upcomingShifts,
        pendingHolidays,
      },
    });
  } catch (err) {
    console.error('❌ candidate-me error:', err);
    try { await db.end(); } catch { /* ignore */ }
    return jsonResponse(500, { error: 'Internal server error.' });
  }
};

async function getRegistrationProgress(db, contactId) {
  try {
    const res = await db.query(
      `SELECT
         right_to_work,
         phone,
         email,
         date_of_birth,
         address,
         part2_completed_status,
         (SELECT COUNT(*) FROM compliance_documents WHERE contact_id = $1 AND status = 'approved') AS docs_approved
       FROM contacts WHERE id = $1`,
      [contactId]
    );
    if (res.rows.length === 0) return { completed: 0, total: 5 };
    const r = res.rows[0];
    let completed = 0;
    if (r.right_to_work) completed++;
    if (r.phone && r.email) completed++;
    if (r.date_of_birth && r.address) completed++;
    if (r.part2_completed_status === 'completed') completed++;
    if (parseInt(r.docs_approved, 10) > 0) completed++;
    return { completed, total: 5 };
  } catch {
    return { completed: 0, total: 5 };
  }
}
