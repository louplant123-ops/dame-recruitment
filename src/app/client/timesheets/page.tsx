'use client'

import { useEffect, useState } from 'react'
import { useClientAuth, clientFetch } from '@/hooks/useClientAuth'
import ClientPortalShell from '../ClientPortalShell'

interface Entry {
  id: string
  worker_name: string
  date: string
  start_time: string | null
  end_time: string | null
  hours_worked: number
  overtime_hours: number | null
  charge_rate: number | null
  status: string
}

interface Timesheet {
  id: string
  week_ending_date: string
  status: string
  total_hours: number
  total_workers: number
  submitted_at: string
  approved_at: string | null
  comments: string | null
  entries: Entry[]
}

const TS_STATUS: Record<string, { label: string; bg: string; text: string }> = {
  submitted: { label: 'Awaiting approval', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  approved:  { label: 'Approved',          bg: 'bg-green-50',  text: 'text-green-700' },
  rejected:  { label: 'Rejected',          bg: 'bg-red-50',    text: 'text-red-600'   },
  draft:     { label: 'Draft',             bg: 'bg-gray-100',  text: 'text-gray-500'  },
}

export default function TimesheetsPage() {
  const { client, loading } = useClientAuth()
  const [timesheets, setTimesheets] = useState<Timesheet[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [tab, setTab] = useState<'pending' | 'all'>('pending')

  useEffect(() => {
    if (!client) return
    clientFetch('/.netlify/functions/client-timesheets')
      .then(r => r.json())
      .then(d => setTimesheets(d.timesheets || []))
      .catch(console.error)
      .finally(() => setDataLoading(false))
  }, [client])

  async function respond(id: string, action: 'approve' | 'reject') {
    setActionLoading(id)
    try {
      const res = await clientFetch('/.netlify/functions/client-timesheets', {
        method: 'POST',
        body: JSON.stringify({ id, action }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      setTimesheets(prev => prev.map(ts =>
        ts.id === id ? { ...ts, status: d.status } : ts
      ))
      flash(action === 'approve' ? 'Timesheet approved.' : 'Timesheet rejected.', action === 'approve')
    } catch (err: any) {
      flash(err.message || 'Something went wrong.', false)
    } finally {
      setActionLoading(null)
    }
  }

  function flash(msg: string, ok: boolean) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  if (loading) return null

  const pending = timesheets.filter(ts => ts.status === 'submitted')
  const visible = tab === 'pending' ? pending : timesheets

  return (
    <ClientPortalShell clientName={client?.name} company={client?.company ?? undefined}
      pendingTimesheets={pending.length}>
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
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-heading font-bold text-[22px] text-charcoal border-l-2 border-primary-red pl-3">Timesheets</h2>
            <p className="text-sm text-gray-400 mt-0.5">Review and approve</p>
          </div>
          {pending.length > 0 && (
            <span className="bg-yellow-50 text-yellow-700 text-xs font-bold px-2.5 py-1 rounded-full mb-0.5">
              {pending.length} pending
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="dame-portal-card flex p-1 gap-1">
          {([['pending', 'Pending'] , ['all', 'All']] as const).map(([val, label]) => (
            <button key={val} onClick={() => setTab(val)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all
                ${tab === val ? 'bg-primary-red text-white' : 'text-gray-400 hover:text-gray-600'}`}>
              {label} {val === 'pending' && pending.length > 0 && `(${pending.length})`}
            </button>
          ))}
        </div>

        {dataLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1,2].map(i => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
          </div>
        ) : visible.length === 0 ? (
          <div className="dame-portal-card p-8 text-center">
            <p className="font-semibold text-charcoal text-sm">
              {tab === 'pending' ? 'No timesheets awaiting approval' : 'No timesheets yet'}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              {tab === 'pending' ? "You're all caught up." : 'Timesheets appear once your consultant submits them.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map(ts => {
              const isOpen = expanded === ts.id
              const cfg = TS_STATUS[ts.status] || TS_STATUS.draft
              const weekEnd = new Date(ts.week_ending_date + 'T00:00:00')
              const totalCost = ts.entries.reduce((sum, e) =>
                sum + (e.hours_worked * (e.charge_rate || 0)), 0)

              return (
                <div key={ts.id} className="dame-portal-card overflow-hidden p-0">
                  <button
                    onClick={() => setExpanded(isOpen ? null : ts.id)}
                    className="w-full px-4 py-3.5 flex items-start gap-3 text-left"
                  >
                    {/* Week date column */}
                    <div className="w-12 flex-shrink-0 flex flex-col items-center bg-[#F0F2F5]
                      rounded-xl py-2 px-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        {weekEnd.toLocaleDateString('en-GB', { month: 'short' })}
                      </span>
                      <span className="text-xl font-heading font-bold text-charcoal leading-tight">
                        {weekEnd.getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-charcoal text-sm">
                          Week ending {weekEnd.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </p>
                        <span className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wide
                          px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {ts.total_workers} worker{ts.total_workers !== 1 ? 's' : ''}
                        {' · '}{ts.total_hours}h
                        {totalCost > 0 && ` · £${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </p>
                    </div>
                    <svg className={`w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5 transition-transform
                      ${isOpen ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isOpen && (
                    <div className="border-t border-gray-50 px-4 pb-4 pt-3 space-y-2">
                      {ts.entries.length > 0 ? (
                        <div className="space-y-1.5">
                          {ts.entries.slice(0, 10).map(e => (
                            <div key={e.id} className="flex items-center justify-between
                              bg-[#F0F2F5] rounded-xl px-3 py-2.5">
                              <div>
                                <p className="text-xs font-semibold text-charcoal">{e.worker_name}</p>
                                <p className="text-[11px] text-gray-400">
                                  {new Date(e.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                                  {e.hours_worked ? ` · ${e.hours_worked}h` : ''}
                                  {e.overtime_hours ? ` (${e.overtime_hours}h OT)` : ''}
                                </p>
                              </div>
                              {e.charge_rate && (
                                <p className="text-xs font-semibold text-charcoal">
                                  £{(e.hours_worked * e.charge_rate).toFixed(2)}
                                </p>
                              )}
                            </div>
                          ))}
                          {ts.entries.length > 10 && (
                            <p className="text-xs text-gray-400 text-center pt-1">
                              +{ts.entries.length - 10} more entries
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 text-center py-2">No entries available.</p>
                      )}

                      {ts.status === 'submitted' && (
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => respond(ts.id, 'approve')}
                            disabled={actionLoading === ts.id}
                            className="flex-1 py-2.5 bg-green-500 text-white text-xs font-bold
                              rounded-xl disabled:opacity-40 active:scale-[0.97] transition-all"
                          >
                            {actionLoading === ts.id ? '…' : '✓ Approve'}
                          </button>
                          <button
                            onClick={() => respond(ts.id, 'reject')}
                            disabled={actionLoading === ts.id}
                            className="flex-1 py-2.5 bg-red-50 text-primary-red text-xs font-bold
                              rounded-xl border border-red-100 disabled:opacity-40
                              active:scale-[0.97] transition-all"
                          >
                            {actionLoading === ts.id ? '…' : '✕ Reject'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </ClientPortalShell>
  )
}

