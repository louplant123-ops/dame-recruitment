/**
 * GET /netlify/functions/client-invoices
 * Authorization: Bearer <token>
 * Query: ?status=sent|paid|overdue|all (default: all)
 *
 * Returns invoices for this client, newest first.
 */
const { getDbClient } = require('./db');
const { validateClientSession, unauthorised, preflight, jsonResponse } = require('./client-auth');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflight();
  if (event.httpMethod !== 'GET') return jsonResponse(405, { error: 'Method not allowed' });

  const clientId = await validateClientSession(event.headers?.authorization);
  if (!clientId) return unauthorised();

  const params = event.queryStringParameters || {};
  const statusFilter = params.status && params.status !== 'all' ? params.status : null;

  const db = getDbClient();
  try {
    await db.connect();

    const statusClause = statusFilter ? `AND ci.status = $2` : '';
    const queryParams  = statusFilter ? [clientId, statusFilter] : [clientId];

    const result = await db.query(
      `SELECT
         ci.id,
         ci.invoice_number,
         ci.invoice_date,
         ci.due_date,
         ci.amount,
         ci.vat_amount,
         ci.total_amount,
         ci.status,
         ci.payment_terms,
         ci.description,
         ci.paid_date,
         ci.paid_amount,
         ci.payment_method,
         ci.timesheet_ids
       FROM client_invoices ci
       WHERE ci.client_id = $1
         ${statusClause}
       ORDER BY ci.invoice_date DESC
       LIMIT 50`,
      queryParams
    );

    await db.end();

    // Summary totals
    const rows = result.rows;
    const outstandingTotal = rows
      .filter(r => ['sent', 'overdue'].includes(r.status))
      .reduce((sum, r) => sum + parseFloat(r.total_amount || 0), 0);
    const paidTotal = rows
      .filter(r => r.status === 'paid')
      .reduce((sum, r) => sum + parseFloat(r.paid_amount || r.total_amount || 0), 0);

    return jsonResponse(200, {
      invoices: rows,
      summary: {
        outstanding: outstandingTotal,
        paid: paidTotal,
        total: rows.length,
      },
    });
  } catch (err) {
    console.error('❌ client-invoices error:', err);
    try { await db.end(); } catch { /* ignore */ }
    return jsonResponse(500, { error: 'Internal server error.' });
  }
};
