'use client'

import { useEffect, useState } from 'react'
import { usePortalAuth, portalFetch } from '@/hooks/usePortalAuth'
import PortalShell from '../PortalShell'

interface HolidayRequest {
  id: string
  start_date: string
  end_date: string
  days_requested: number
  status: string
  notes: string | null
  created_at: string
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  pending:  { label: 'Pending',  bg: 'bg-yellow-50', text: 'text-yellow-700' },
  approved: { label: 'Approved', bg: 'bg-green-50',  text: 'text-green-700' },
  rejected: { label: 'Rejected', bg: 'bg-red-50',    text: 'text-red-600' },
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function HolidayPage() {
  const { candidate, loading } = usePortalAuth()
  const [balance, setBalance] = useState<number | null>(null)
  const [requests, setRequests] = useState<HolidayRequest[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  useEffect(() => {
    if (!candidate) return
    portalFetch('/.netlify/functions/candidate-holiday')
      .then(r => r.json())
      .then(d => { setBalance(d.balance_days ?? null); setRequests(d.requests || []) })
      .catch(console.error)
      .finally(() => setDataLoading(false))
  }, [candidate])

  function workingDays(a: string, b: string): number {
    if (!a || !b) return 0
    let count = 0
    const current = new Date(a)
    const end = new Date(b)
    while (current <= end) {
      const day = current.getDay()
      if (day !== 0 && day !== 6) count++
      current.setDate(current.getDate() + 1)
    }
    return count
  }

  async function submitRequest() {
    if (!startDate || !endDate || new Date(endDate) < new Date(startDate)) {
      flash('Please select a valid date range.', false)
      return
    }
    setSubmitting(true)
    try {
      const res = await portalFetch('/.netlify/functions/candidate-holiday', {
        method: 'POST',
        body: JSON.stringify({ startDate, endDate, notes }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      if (d.request) setRequests(prev => [d.request, ...prev])
      setStartDate(''); setEndDate(''); setNotes('')
      flash('Request submitted — your consultant will be in touch.', true)
    } catch (err: any) {
      flash(err.message || 'Something went wrong.', false)
    } finally {
      setSubmitting(false)
    }
  }

  function flash(msg: string, ok: boolean) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  if (loading) return null

  const daysSelected = workingDays(startDate, endDate)
  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <PortalShell candidateName={candidate?.name} registrationType={candidate?.registrationType}>
      {toast && (
        <div className={`fixed top-4 left-4 right-4 z-50 rounded-2xl px-4 py-3.5 text-sm font-semibold
          shadow-lift-lg flex items-center gap-2
          ${toast.ok ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            {toast.ok
              ? <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              : <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />}
          </svg>
          {toast.msg}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h2 className="font-heading font-bold text-[22px] text-charcoal">Holiday</h2>
          <p className="text-sm text-gray-400 mt-0.5">Request time off</p>
        </div>

        {/* Balance pill */}
        {balance !== null && (
          <div className="dame-portal-card px-4 py-3.5 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium">Holiday balance</p>
              <p className="font-heading font-bold text-3xl text-charcoal leading-tight">{balance}</p>
              <p className="text-xs text-gray-400">days remaining</p>
            </div>
            <div className="w-14 h-14 bg-primary-red/10 rounded-2xl flex items-center justify-center">
              <svg className="w-7 h-7 text-primary-red" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}

        {/* Request form */}
        <div className="dame-portal-card px-4 py-4 space-y-3">
          <p className="font-bold text-charcoal text-sm">New request</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1">From</label>
              <input
                type="date"
                value={startDate}
                min={todayStr}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-[#F0F2F5] rounded-xl px-3 py-2.5 text-sm text-charcoal
                           focus:outline-none focus:ring-2 focus:ring-primary-red/30"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1">To</label>
              <input
                type="date"
                value={endDate}
                min={startDate || todayStr}
                onChange={e => setEndDate(e.target.value)}
                className="w-full bg-[#F0F2F5] rounded-xl px-3 py-2.5 text-sm text-charcoal
                           focus:outline-none focus:ring-2 focus:ring-primary-red/30"
              />
            </div>
          </div>

          {daysSelected > 0 && (
            <div className="bg-primary-red/5 rounded-xl px-3 py-2 text-xs text-primary-red font-semibold">
              {daysSelected} working day{daysSelected !== 1 ? 's' : ''} selected
            </div>
          )}

          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Any additional notes (optional)"
            rows={2}
            className="w-full bg-[#F0F2F5] rounded-xl px-3 py-2.5 text-sm text-charcoal
                       placeholder:text-gray-300 resize-none focus:outline-none
                       focus:ring-2 focus:ring-primary-red/30"
          />

          <button
            onClick={submitRequest}
            disabled={submitting || !startDate || !endDate}
            className="w-full py-3 bg-primary-red text-white font-bold text-sm rounded-xl
                       disabled:opacity-40 active:scale-[0.98] transition-all"
          >
            {submitting ? 'Submitting…' : 'Submit request'}
          </button>
        </div>

        {/* Past requests */}
        {!dataLoading && requests.length > 0 && (
          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
              Past requests
            </p>
            {requests.map(r => {
              const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending
              return (
                <div key={r.id} className="dame-portal-card px-4 py-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-charcoal">
                        {formatDate(r.start_date)}
                        {r.start_date !== r.end_date && <> – {formatDate(r.end_date)}</>}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {r.days_requested} day{r.days_requested !== 1 ? 's' : ''}
                        {r.notes ? ` · ${r.notes}` : ''}
                      </p>
                    </div>
                    <span className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wide
                      px-2 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
                      {cfg.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </PortalShell>
  )
}
