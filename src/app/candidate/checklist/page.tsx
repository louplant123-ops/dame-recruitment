'use client'

import { useEffect, useState } from 'react'
import { usePortalAuth, portalFetch } from '@/hooks/usePortalAuth'
import PortalShell from '../PortalShell'

interface ChecklistItem {
  step_key: string
  step_label: string
  completed: boolean
  completed_at: string | null
}

export default function ChecklistPage() {
  const { candidate, loading } = usePortalAuth()
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  useEffect(() => {
    if (!candidate) return
    portalFetch('/.netlify/functions/candidate-perm-checklist')
      .then(r => r.json())
      .then(d => setItems(d.checklist || []))
      .catch(console.error)
      .finally(() => setDataLoading(false))
  }, [candidate])

  async function toggle(stepKey: string, current: boolean) {
    setUpdating(stepKey)
    try {
      const res = await portalFetch('/.netlify/functions/candidate-perm-checklist', {
        method: 'POST',
        body: JSON.stringify({ stepKey, completed: !current }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      setItems(prev => prev.map(item =>
        item.step_key === stepKey ? { ...item, completed: !current, completed_at: !current ? new Date().toISOString() : null } : item
      ))
    } catch (err: any) {
      flash(err.message || 'Something went wrong.', false)
    } finally {
      setUpdating(null)
    }
  }

  function flash(msg: string, ok: boolean) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  if (loading) return null

  const completed = items.filter(i => i.completed).length
  const total = items.length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
  const allDone = completed === total && total > 0

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
          <h2 className="font-heading font-bold text-[22px] text-charcoal">Pre-start checklist</h2>
          <p className="text-sm text-gray-400 mt-0.5">Everything you need before day one</p>
        </div>

        {dataLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-16 bg-gray-200 rounded-2xl" />
            {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-gray-200 rounded-2xl" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="dame-portal-card p-8 text-center">
            <div className="w-14 h-14 dame-icon-chip mx-auto mb-3">
              <svg className="w-7 h-7 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="font-semibold text-charcoal text-sm">No checklist yet</p>
            <p className="text-gray-400 text-xs mt-1">Your checklist will appear once a placement is confirmed.</p>
          </div>
        ) : (
          <>
            {/* Progress card */}
            <div className={`dame-portal-card px-4 py-4 transition-colors
              ${allDone ? 'bg-green-500' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className={`text-xs font-medium ${allDone ? 'text-green-100' : 'text-gray-400'}`}>
                    Progress
                  </p>
                  <p className={`font-heading font-bold text-2xl leading-tight ${allDone ? 'text-white' : 'text-charcoal'}`}>
                    {completed}/{total} <span className={`text-base font-normal ${allDone ? 'text-green-200' : 'text-gray-400'}`}>steps</span>
                  </p>
                </div>
                <div className={`relative w-14 h-14 flex items-center justify-center rounded-2xl
                  ${allDone ? 'bg-green-400/40' : 'bg-[#F0F2F5]'}`}>
                  <span className={`font-heading font-bold text-lg ${allDone ? 'text-white' : 'text-charcoal'}`}>
                    {pct}%
                  </span>
                </div>
              </div>

              <div className={`w-full rounded-full h-1.5 ${allDone ? 'bg-green-400/30' : 'bg-[#F0F2F5]'}`}>
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${allDone ? 'bg-white' : 'bg-primary-red'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {allDone && (
                <p className="text-green-100 text-xs font-semibold mt-3">
                  All done — you&apos;re ready to start!
                </p>
              )}
            </div>

            {/* Items */}
            <div className="space-y-2">
              {items.map(item => (
                <button
                  key={item.step_key}
                  onClick={() => toggle(item.step_key, item.completed)}
                  disabled={updating === item.step_key}
                  className={`w-full text-left dame-portal-card px-4 py-3.5
                    flex items-center gap-3 active:scale-[0.99] transition-all
                    disabled:opacity-60`}
                >
                  {/* Checkbox */}
                  <div className={`w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center
                    transition-colors ${item.completed
                      ? 'bg-green-500'
                      : 'bg-[#F0F2F5] border-2 border-gray-200'}`}>
                    {updating === item.step_key ? (
                      <svg className="animate-spin w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : item.completed ? (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : null}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold leading-tight ${item.completed ? 'text-gray-400 line-through' : 'text-charcoal'}`}>
                      {item.step_label}
                    </p>
                    {item.completed && item.completed_at && (
                      <p className="text-[11px] text-gray-300 mt-0.5">
                        Done {new Date(item.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </p>
                    )}
                  </div>

                  <svg className={`w-4 h-4 flex-shrink-0 transition-colors ${item.completed ? 'text-green-400' : 'text-gray-200'}`}
                    fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </PortalShell>
  )
}
