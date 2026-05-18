'use client'

import { useEffect, useState } from 'react'
import { usePortalAuth, portalFetch } from '@/hooks/usePortalAuth'
import PortalShell from '../PortalShell'

interface Shift {
  id: string
  shift_date: string
  start_time: string | null
  end_time: string | null
  status: string
  job_title: string
  site_name: string
  notes: string | null
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; text: string; bg: string }> = {
  confirmed:  { label: 'Confirmed',  dot: 'bg-green-400',  text: 'text-green-700',  bg: 'bg-green-50' },
  scheduled:  { label: 'Scheduled',  dot: 'bg-blue-400',   text: 'text-blue-700',   bg: 'bg-blue-50' },
  declined:   { label: 'Declined',   dot: 'bg-red-400',    text: 'text-red-700',    bg: 'bg-red-50' },
  cancelled:  { label: 'Cancelled',  dot: 'bg-gray-300',   text: 'text-gray-500',   bg: 'bg-gray-50' },
  pending:    { label: 'Pending',    dot: 'bg-yellow-400', text: 'text-yellow-700', bg: 'bg-yellow-50' },
  no_show:    { label: 'No show',    dot: 'bg-red-400',    text: 'text-red-600',    bg: 'bg-red-50' },
}

function formatTime(t: string | null): string {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hour = parseInt(h, 10)
  return `${hour > 12 ? hour - 12 : hour || 12}:${m}${hour >= 12 ? 'pm' : 'am'}`
}

export default function ShiftsPage() {
  const { candidate, loading } = usePortalAuth()
  const [shifts, setShifts] = useState<Shift[]>([])
  const [shiftsLoading, setShiftsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  useEffect(() => {
    if (!candidate) return
    portalFetch('/.netlify/functions/candidate-shifts')
      .then(r => r.json())
      .then(d => setShifts(d.shifts || []))
      .catch(console.error)
      .finally(() => setShiftsLoading(false))
  }, [candidate])

  async function respond(shiftId: string, action: 'confirm' | 'decline') {
    setActionLoading(shiftId)
    try {
      const res = await portalFetch('/.netlify/functions/candidate-shifts', {
        method: 'POST',
        body: JSON.stringify({ shiftId, action }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setShifts(prev => prev.map(s => s.id === shiftId ? { ...s, status: data.status } : s))
      flash(action === 'confirm' ? 'Shift confirmed — see you there!' : 'Shift declined.', action === 'confirm')
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

  const active = shifts.filter(s => !['cancelled', 'declined', 'no_show'].includes(s.status))
  const today = new Date().toDateString()
  const tomorrow = new Date(Date.now() + 86400000).toDateString()

  return (
    <PortalShell candidateName={candidate?.name} registrationType={candidate?.registrationType}>
      {toast && (
        <div className={`fixed top-4 left-4 right-4 z-50 rounded-2xl px-4 py-3.5 text-sm font-semibold
          shadow-lift-lg animate-slide-up flex items-center gap-2
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
          <h2 className="font-heading font-bold text-[22px] text-charcoal">Your shifts</h2>
          <p className="text-sm text-gray-400 mt-0.5">Next 28 days</p>
        </div>

        {shiftsLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
          </div>
        ) : active.length === 0 ? (
          <div className="dame-portal-card p-8 text-center">
            <div className="w-14 h-14 dame-icon-chip mx-auto mb-3">
              <svg className="w-7 h-7 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="font-semibold text-charcoal text-sm">No upcoming shifts</p>
            <p className="text-gray-400 text-xs mt-1 leading-relaxed">
              Nothing scheduled in the next 28 days.<br />
              Call your consultant if you&apos;re expecting work.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {active.map(shift => {
              const date = new Date(shift.shift_date)
              const isToday = date.toDateString() === today
              const isTomorrow = date.toDateString() === tomorrow
              const canRespond = ['scheduled', 'pending'].includes(shift.status)
              const cfg = STATUS_CONFIG[shift.status] || STATUS_CONFIG.scheduled

              return (
                <div key={shift.id} className="dame-portal-card overflow-hidden p-0">
                  <div className="flex">
                    {/* Date column */}
                    <div className={`w-[72px] flex-shrink-0 flex flex-col items-center justify-center py-4
                      ${isToday ? 'bg-primary-red' : isTomorrow ? 'bg-[#222222]' : 'bg-[#F0F2F5]'}`}>
                      <span className={`text-[10px] font-bold uppercase tracking-wider
                        ${isToday || isTomorrow ? 'text-white/60' : 'text-gray-400'}`}>
                        {isToday ? 'Today' : isTomorrow ? 'Tmrw' : date.toLocaleDateString('en-GB', { weekday: 'short' })}
                      </span>
                      <span className={`text-3xl font-heading font-bold leading-none mt-0.5
                        ${isToday || isTomorrow ? 'text-white' : 'text-charcoal'}`}>
                        {date.getDate()}
                      </span>
                      <span className={`text-[10px] font-medium
                        ${isToday || isTomorrow ? 'text-white/50' : 'text-gray-400'}`}>
                        {date.toLocaleDateString('en-GB', { month: 'short' })}
                      </span>
                    </div>

                    {/* Detail */}
                    <div className="flex-1 px-3.5 py-3.5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-charcoal text-sm leading-tight truncate">
                            {shift.job_title}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                            <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            {shift.site_name}
                          </p>
                          {(shift.start_time || shift.end_time) && (
                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                              <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              {[shift.start_time, shift.end_time].filter(Boolean).map(formatTime).join(' – ')}
                            </p>
                          )}
                        </div>
                        <span className={`flex-shrink-0 flex items-center gap-1 text-[10px] font-bold
                          uppercase tracking-wide px-2 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </div>

                      {canRespond && (
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() => respond(shift.id, 'confirm')}
                            disabled={actionLoading === shift.id}
                            className="flex-1 py-2 bg-green-500 text-white text-xs font-bold rounded-xl
                                       disabled:opacity-40 active:scale-[0.97] transition-all"
                          >
                            {actionLoading === shift.id ? '…' : "✓  I'll be there"}
                          </button>
                          <button
                            onClick={() => respond(shift.id, 'decline')}
                            disabled={actionLoading === shift.id}
                            className="flex-1 py-2 bg-red-50 text-primary-red text-xs font-bold
                                       rounded-xl border border-red-100 disabled:opacity-40 active:scale-[0.97] transition-all"
                          >
                            {actionLoading === shift.id ? '…' : "✕  Can't make it"}
                          </button>
                        </div>
                      )}
                    </div>
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
