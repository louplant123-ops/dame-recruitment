'use client'

import { useEffect, useState } from 'react'
import { usePortalAuth, portalFetch } from '@/hooks/usePortalAuth'
import PortalShell from '../PortalShell'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
type Day = typeof DAYS[number]

const DAY_LABELS: Record<Day, { short: string; full: string }> = {
  monday:    { short: 'M',  full: 'Monday'    },
  tuesday:   { short: 'T',  full: 'Tuesday'   },
  wednesday: { short: 'W',  full: 'Wednesday' },
  thursday:  { short: 'T',  full: 'Thursday'  },
  friday:    { short: 'F',  full: 'Friday'    },
  saturday:  { short: 'Sa', full: 'Saturday'  },
  sunday:    { short: 'Su', full: 'Sunday'    },
}

const DEFAULT_DAYS: Record<Day, boolean> = {
  monday: true, tuesday: true, wednesday: true, thursday: true, friday: true,
  saturday: false, sunday: false,
}

function getMondayOf(offsetWeeks = 0): string {
  const d = new Date()
  const day = d.getDay()
  const toMonday = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + toMonday + offsetWeeks * 7)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function labelForOffset(offset: number): string {
  if (offset === 0) return 'This week'
  if (offset === 1) return 'Next week'
  const d = new Date(getMondayOf(offset) + 'T00:00:00')
  return `w/c ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
}

export default function AvailabilityPage() {
  const { candidate, loading } = usePortalAuth()
  const [weekOffset, setWeekOffset] = useState(0)
  const [avail, setAvail] = useState<Record<Day, boolean>>(DEFAULT_DAYS)
  const [notes, setNotes] = useState('')
  const [dataLoading, setDataLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const weekStart = getMondayOf(weekOffset)

  useEffect(() => {
    if (!candidate) return
    setDataLoading(true)
    portalFetch(`/.netlify/functions/candidate-availability?weekStart=${weekStart}`)
      .then(r => r.json())
      .then(d => {
        if (d.availability) {
          const a = d.availability
          setAvail({
            monday: a.monday ?? true,  tuesday: a.tuesday ?? true,
            wednesday: a.wednesday ?? true, thursday: a.thursday ?? true,
            friday: a.friday ?? true,  saturday: a.saturday ?? false, sunday: a.sunday ?? false,
          })
          setNotes(a.notes || '')
        } else {
          setAvail(DEFAULT_DAYS)
          setNotes('')
        }
      })
      .catch(console.error)
      .finally(() => setDataLoading(false))
  }, [candidate, weekStart])

  function toggle(day: Day) {
    setAvail(prev => ({ ...prev, [day]: !prev[day] }))
  }

  async function save() {
    setSaving(true)
    try {
      const res = await portalFetch('/.netlify/functions/candidate-availability', {
        method: 'POST',
        body: JSON.stringify({ weekStart, ...avail, notes }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      flash('Availability saved!', true)
    } catch (err: any) {
      flash(err.message || 'Something went wrong.', false)
    } finally {
      setSaving(false)
    }
  }

  function flash(msg: string, ok: boolean) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  if (loading) return null

  const availableCount = DAYS.filter(d => avail[d]).length
  const weekdays  = DAYS.slice(0, 5)
  const weekend   = DAYS.slice(5)

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
          <h2 className="font-heading font-bold text-[22px] text-charcoal">Availability</h2>
          <p className="text-sm text-gray-400 mt-0.5">Tell us when you can work</p>
        </div>

        {/* Week selector */}
        <div className="dame-portal-card px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setWeekOffset(o => Math.max(0, o - 1))}
            disabled={weekOffset === 0}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#F0F2F5]
                       disabled:opacity-30 active:scale-95 transition-all"
          >
            <svg className="w-4 h-4 text-charcoal" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <p className="font-bold text-charcoal text-sm">{labelForOffset(weekOffset)}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(weekStart + 'T00:00:00').toLocaleDateString('en-GB',
                { day: 'numeric', month: 'short' })}
            </p>
          </div>
          <button
            onClick={() => setWeekOffset(o => Math.min(3, o + 1))}
            disabled={weekOffset === 3}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#F0F2F5]
                       disabled:opacity-30 active:scale-95 transition-all"
          >
            <svg className="w-4 h-4 text-charcoal" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day grid */}
        <div className="dame-portal-card px-4 py-4 space-y-4">
          {dataLoading ? (
            <div className="flex gap-2.5 animate-pulse">
              {DAYS.map(d => <div key={d} className="flex-1 h-16 bg-gray-200 rounded-xl" />)}
            </div>
          ) : (
            <>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Weekdays</p>
                <div className="flex gap-2">
                  {weekdays.map(day => (
                    <button
                      key={day}
                      onClick={() => toggle(day)}
                      className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all
                        active:scale-95 ${avail[day]
                          ? 'bg-primary-red text-white shadow-sm'
                          : 'bg-[#F0F2F5] text-gray-400'}`}
                    >
                      <span className="text-[10px] font-bold">{DAY_LABELS[day].short}</span>
                      {avail[day] && (
                        <span className="mt-1 w-1 h-1 rounded-full bg-white/50" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Weekend</p>
                <div className="flex gap-2">
                  {weekend.map(day => (
                    <button
                      key={day}
                      onClick={() => toggle(day)}
                      className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all
                        active:scale-95 ${avail[day]
                          ? 'bg-charcoal text-white shadow-sm'
                          : 'bg-[#F0F2F5] text-gray-400'}`}
                    >
                      <span className="text-[10px] font-bold">{DAY_LABELS[day].short}</span>
                      <span className="text-[10px] mt-0.5 font-medium opacity-70">{DAY_LABELS[day].full.slice(0,3)}</span>
                    </button>
                  ))}
                  {/* Padding to match weekday row width */}
                  {[1,2,3].map(i => <div key={i} className="flex-1" />)}
                </div>
              </div>

              <div className={`text-xs px-2 py-1.5 rounded-xl text-center font-medium
                ${availableCount > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {availableCount === 0
                  ? 'No days selected — your consultant will be notified'
                  : `Available ${availableCount} day${availableCount !== 1 ? 's' : ''} this week`}
              </div>
            </>
          )}
        </div>

        {/* Notes */}
        <div className="dame-portal-card px-4 py-4">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Can't do early starts on Friday, prefer day shifts"
            rows={2}
            className="w-full bg-[#F0F2F5] rounded-xl px-3 py-2.5 text-sm text-charcoal
                       placeholder:text-gray-300 resize-none focus:outline-none
                       focus:ring-2 focus:ring-primary-red/30"
          />
        </div>

        <button
          onClick={save}
          disabled={saving || dataLoading}
          className="w-full py-3.5 bg-primary-red text-white font-bold text-sm rounded-2xl
                     shadow-lift disabled:opacity-40 active:scale-[0.98] transition-all"
        >
          {saving ? 'Saving…' : 'Save availability'}
        </button>
      </div>
    </PortalShell>
  )
}
