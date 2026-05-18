'use client'

import { useEffect, useState } from 'react'
import { useClientAuth, clientFetch } from '@/hooks/useClientAuth'
import ClientPortalShell from '../ClientPortalShell'

interface Shift {
  id: string
  shift_date: string
  start_time: string | null
  end_time: string | null
  hours_worked: number | null
  status: string
  charge_rate: number | null
}

interface Worker {
  candidate_id: string
  worker_name: string
  job_title: string
  placement_type: string
  charge_rate: number | null
  start_date: string
  shifts: Shift[]
}

const SHIFT_STATUS: Record<string, { label: string; bg: string; text: string }> = {
  confirmed:  { label: 'Confirmed',  bg: 'bg-green-50',  text: 'text-green-700'  },
  scheduled:  { label: 'Scheduled',  bg: 'bg-blue-50',   text: 'text-blue-700'   },
  worked:     { label: 'Worked',     bg: 'bg-green-50',  text: 'text-green-700'  },
  cancelled:  { label: 'Cancelled',  bg: 'bg-gray-100',  text: 'text-gray-500'   },
  no_show:    { label: 'No show',    bg: 'bg-red-50',    text: 'text-red-600'    },
  pending:    { label: 'Pending',    bg: 'bg-yellow-50', text: 'text-yellow-700' },
}

function fmtTime(t: string | null) {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hour = parseInt(h, 10)
  return `${hour > 12 ? hour - 12 : hour || 12}:${m}${hour >= 12 ? 'pm' : 'am'}`
}

function fmtDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function WorkforcePage() {
  const { client, loading } = useClientAuth()
  const [workforce, setWorkforce] = useState<Worker[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (!client) return
    clientFetch('/.netlify/functions/client-workforce')
      .then(r => r.json())
      .then(d => setWorkforce(d.workforce || []))
      .catch(console.error)
      .finally(() => setDataLoading(false))
  }, [client])

  if (loading) return null

  return (
    <ClientPortalShell clientName={client?.name} company={client?.company ?? undefined}>
      <div className="space-y-4">
        <div>
          <h2 className="font-heading font-bold text-[22px] text-charcoal border-l-2 border-primary-red pl-3">Workforce</h2>
          <p className="text-sm text-gray-400 mt-0.5">Active workers + upcoming shifts</p>
        </div>

        {dataLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-200 rounded-2xl" />)}
          </div>
        ) : workforce.length === 0 ? (
          <div className="dame-portal-card p-8 text-center">
            <div className="w-14 h-14 dame-icon-chip mx-auto mb-3">
              <svg className="w-7 h-7 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
            </div>
            <p className="font-semibold text-charcoal text-sm">No active workers</p>
            <p className="text-gray-400 text-xs mt-1">Contact your consultant to arrange placements.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {workforce.map(worker => {
              const isOpen = expanded === worker.candidate_id
              const upcomingShifts = worker.shifts.filter(s =>
                new Date(s.shift_date) >= new Date(new Date().toDateString()) &&
                !['cancelled', 'no_show'].includes(s.status)
              )
              return (
                <div key={worker.candidate_id} className="dame-portal-card overflow-hidden p-0">
                  <button
                    onClick={() => setExpanded(isOpen ? null : worker.candidate_id)}
                    className="w-full px-4 py-3.5 flex items-center gap-3 text-left"
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 dame-icon-chip flex-shrink-0">
                      <span className="text-primary-red font-bold text-sm">
                        {(worker.worker_name || '?').charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-charcoal text-sm truncate">{worker.worker_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{worker.job_title}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {upcomingShifts.length > 0 && (
                        <span className="text-[10px] font-bold bg-blue-50 text-blue-600
                          px-2 py-0.5 rounded-full">
                          {upcomingShifts.length} shift{upcomingShifts.length !== 1 ? 's' : ''}
                        </span>
                      )}
                      <svg className={`w-4 h-4 text-gray-300 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-gray-50 px-4 pb-4 pt-3 space-y-2">
                      <div className="flex gap-4 mb-3">
                        <div>
                          <p className="text-[10px] text-gray-400 font-medium">Placement type</p>
                          <p className="text-xs font-semibold text-charcoal capitalize">{worker.placement_type || 'Temp'}</p>
                        </div>
                        {worker.charge_rate && (
                          <div>
                            <p className="text-[10px] text-gray-400 font-medium">Charge rate</p>
                            <p className="text-xs font-semibold text-charcoal">£{worker.charge_rate}/hr</p>
                          </div>
                        )}
                        <div>
                          <p className="text-[10px] text-gray-400 font-medium">Start date</p>
                          <p className="text-xs font-semibold text-charcoal">
                            {new Date(worker.start_date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>

                      {upcomingShifts.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-2">No upcoming shifts in the next 14 days.</p>
                      ) : (
                        upcomingShifts.map(s => {
                          const cfg = SHIFT_STATUS[s.status] || SHIFT_STATUS.scheduled
                          return (
                            <div key={s.id} className="flex items-center justify-between
                              bg-[#F0F2F5] rounded-xl px-3 py-2.5">
                              <div>
                                <p className="text-xs font-semibold text-charcoal">{fmtDate(s.shift_date)}</p>
                                {(s.start_time || s.end_time) && (
                                  <p className="text-[11px] text-gray-400">
                                    {[s.start_time, s.end_time].filter(Boolean).map(fmtTime).join(' – ')}
                                    {s.hours_worked ? ` · ${s.hours_worked}h` : ''}
                                  </p>
                                )}
                              </div>
                              <span className={`text-[10px] font-bold uppercase tracking-wide
                                px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                                {cfg.label}
                              </span>
                            </div>
                          )
                        })
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

