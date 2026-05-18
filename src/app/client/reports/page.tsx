'use client'

import { useEffect, useState, useCallback } from 'react'
import { useClientAuth, clientFetch } from '@/hooks/useClientAuth'
import ClientPortalShell from '../ClientPortalShell'

interface Metrics {
  activeWorkers: number
  activePlacements: number
  totalShifts: number
  confirmedShifts: number
  noShowCount: number
  totalHours: number
  fillRate: number | null
  noShowRate: number | null
  timesheetApprovalRate: number | null
}

const PERIODS = [
  { label: 'Last 7 days',   days: 7   },
  { label: 'Last 30 days',  days: 30  },
  { label: 'Last 90 days',  days: 90  },
  { label: 'Last 6 months', days: 182 },
] as const

function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function RateCircle({ value, label, color }: { value: number | null; label: string; color: string }) {
  if (value === null) return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
        <span className="text-xs text-gray-300 font-medium">N/A</span>
      </div>
      <p className="text-[10px] text-gray-400 font-medium text-center">{label}</p>
    </div>
  )
  const r = 22
  const circ = 2 * Math.PI * r
  const dash = (value / 100) * circ
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-16 h-16">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 52 52">
          <circle cx="26" cy="26" r={r} fill="none" stroke="#F0F2F5" strokeWidth="4" />
          <circle cx="26" cy="26" r={r} fill="none" stroke={color} strokeWidth="4"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-heading font-bold text-charcoal text-sm">
          {value}%
        </span>
      </div>
      <p className="text-[10px] text-gray-400 font-medium text-center leading-tight">{label}</p>
    </div>
  )
}

export default function ReportsPage() {
  const { client, loading } = useClientAuth()
  const [periodIdx, setPeriodIdx] = useState(1)
  const [metrics, setMetrics]     = useState<Metrics | null>(null)
  const [from, setFrom]           = useState('')
  const [to, setTo]               = useState('')
  const [dataLoading, setDataLoading] = useState(true)

  const load = useCallback((idx: number) => {
    const toDate   = new Date()
    const fromDate = new Date(Date.now() - PERIODS[idx].days * 86400000)
    const f = isoDate(fromDate)
    const t = isoDate(toDate)
    setFrom(f); setTo(t)
    setDataLoading(true)
    clientFetch(`/.netlify/functions/client-reports?from=${f}&to=${t}`)
      .then(r => r.json())
      .then(d => setMetrics(d.metrics || null))
      .catch(console.error)
      .finally(() => setDataLoading(false))
  }, [])

  useEffect(() => { if (client) load(periodIdx) }, [client, periodIdx, load])

  if (loading) return null

  return (
    <ClientPortalShell clientName={client?.name} company={client?.company ?? undefined}>
      <div className="space-y-4">
        <div>
          <h2 className="font-heading font-bold text-[22px] text-charcoal border-l-2 border-primary-red pl-3">MI Reports</h2>
          <p className="text-sm text-gray-400 mt-0.5">Management information</p>
        </div>

        {/* Period selector */}
        <div className="flex bg-white rounded-xl shadow-card p-1 gap-1 overflow-x-auto">
          {PERIODS.map((p, i) => (
            <button key={p.label} onClick={() => setPeriodIdx(i)}
              className={`flex-shrink-0 flex-1 py-2 text-[11px] font-bold rounded-lg transition-all
                ${periodIdx === i ? 'bg-primary-red text-white' : 'text-gray-400 hover:text-gray-600'}`}>
              {p.label}
            </button>
          ))}
        </div>

        {dataLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-36 bg-gray-200 rounded-2xl" />
            <div className="h-24 bg-gray-200 rounded-2xl" />
          </div>
        ) : metrics ? (
          <>
            {/* Rate dials */}
            <div className="bg-white rounded-2xl shadow-card px-4 py-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Performance
              </p>
              <div className="flex justify-around">
                <RateCircle value={metrics.fillRate}   label="Fill rate"   color="#22c55e" />
                <RateCircle value={metrics.noShowRate} label="No-show rate" color="#ef4444" />
                <RateCircle value={metrics.timesheetApprovalRate} label="TS approval" color="#3b82f6" />
              </div>
            </div>

            {/* Key stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Active workers',    value: metrics.activeWorkers,    unit: '', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', color: 'text-blue-500', bg: 'bg-blue-50' },
                { label: 'Total hours',       value: metrics.totalHours,       unit: 'h', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-purple-500', bg: 'bg-purple-50' },
                { label: 'Shifts confirmed',  value: metrics.confirmedShifts,  unit: '', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-green-500', bg: 'bg-green-50' },
                { label: 'No-shows',          value: metrics.noShowCount,      unit: '', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-red-500', bg: 'bg-red-50' },
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-2xl shadow-card px-3.5 py-3.5 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                    <svg className={`w-5 h-5 ${stat.color}`} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
                    <p className="font-heading font-bold text-charcoal text-xl leading-tight">
                      {stat.value}{stat.unit}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Date range note */}
            <p className="text-xs text-gray-400 text-center pb-1">
              Data from {new Date(from + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              {' to '}
              {new Date(to + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center shadow-card">
            <p className="font-semibold text-charcoal text-sm">No data for this period</p>
            <p className="text-gray-400 text-xs mt-1">
              Reports populate once you have active placements and shifts.
            </p>
          </div>
        )}
      </div>
    </ClientPortalShell>
  )
}

