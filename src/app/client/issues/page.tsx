'use client'

import { useEffect, useState } from 'react'
import { useClientAuth, clientFetch } from '@/hooks/useClientAuth'
import ClientPortalShell from '../ClientPortalShell'

interface Issue {
  id: number
  subject: string
  description: string
  category: string
  status: string
  created_at: string
  resolved_at: string | null
}

const CATEGORY_OPTIONS = [
  { value: 'general',   label: 'General'   },
  { value: 'worker',    label: 'Worker'    },
  { value: 'timesheet', label: 'Timesheet' },
  { value: 'invoice',   label: 'Invoice'   },
] as const

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  open:        { label: 'Open',        bg: 'bg-yellow-50', text: 'text-yellow-700' },
  in_progress: { label: 'In progress', bg: 'bg-blue-50',   text: 'text-blue-700'  },
  resolved:    { label: 'Resolved',    bg: 'bg-green-50',  text: 'text-green-700' },
}

export default function IssuesPage() {
  const { client, loading } = useClientAuth()
  const [issues, setIssues]       = useState<Issue[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [subject, setSubject]     = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory]   = useState<string>('general')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast]         = useState<{ msg: string; ok: boolean } | null>(null)
  const [showForm, setShowForm]   = useState(false)

  useEffect(() => {
    if (!client) return
    clientFetch('/.netlify/functions/client-issues')
      .then(r => r.json())
      .then(d => setIssues(d.issues || []))
      .catch(console.error)
      .finally(() => setDataLoading(false))
  }, [client])

  async function submit() {
    if (!subject.trim() || !description.trim()) {
      flash('Subject and description are required.', false)
      return
    }
    setSubmitting(true)
    try {
      const res = await clientFetch('/.netlify/functions/client-issues', {
        method: 'POST',
        body: JSON.stringify({ subject, description, category }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      if (d.issue) setIssues(prev => [d.issue, ...prev])
      setSubject(''); setDescription(''); setCategory('general')
      setShowForm(false)
      flash("Issue raised — your consultant will be in touch shortly.", true)
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

  const open = issues.filter(i => i.status !== 'resolved').length

  return (
    <ClientPortalShell clientName={client?.name} company={client?.company ?? undefined}>
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
            <h2 className="font-heading font-bold text-[22px] text-charcoal border-l-2 border-primary-red pl-3">Issues</h2>
            <p className="text-sm text-gray-400 mt-0.5">Flag a problem without phoning</p>
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            className="px-4 py-2 bg-primary-red text-white text-xs font-bold rounded-xl
              active:scale-95 transition-all"
          >
            {showForm ? 'Cancel' : '+ New issue'}
          </button>
        </div>

        {/* New issue form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-card px-4 py-4 space-y-3">
            <p className="font-bold text-charcoal text-sm">Raise an issue</p>

            {/* Category pills */}
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setCategory(opt.value)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all
                    ${category === opt.value
                      ? 'bg-primary-red text-white'
                      : 'bg-[#F0F2F5] text-gray-500 hover:bg-gray-200'}`}>
                  {opt.label}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Subject *"
              className="w-full bg-[#F0F2F5] rounded-xl px-3 py-2.5 text-sm text-charcoal
                placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-red/30"
            />
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the issue in detail *"
              rows={3}
              className="w-full bg-[#F0F2F5] rounded-xl px-3 py-2.5 text-sm text-charcoal
                placeholder:text-gray-300 resize-none focus:outline-none
                focus:ring-2 focus:ring-primary-red/30"
            />
            <button
              onClick={submit}
              disabled={submitting || !subject.trim() || !description.trim()}
              className="w-full py-3 bg-primary-red text-white font-bold text-sm rounded-xl
                disabled:opacity-40 active:scale-[0.98] transition-all"
            >
              {submitting ? 'Submitting…' : 'Submit issue'}
            </button>
          </div>
        )}

        {/* Issues list */}
        {dataLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1,2].map(i => <div key={i} className="h-20 bg-gray-200 rounded-2xl" />)}
          </div>
        ) : issues.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-card">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="font-semibold text-charcoal text-sm">No issues raised</p>
            <p className="text-gray-400 text-xs mt-1">Use the button above to flag a problem.</p>
          </div>
        ) : (
          <>
            {open > 0 && (
              <p className="text-xs text-gray-400 px-1">
                {open} open issue{open !== 1 ? 's' : ''}
              </p>
            )}
            <div className="space-y-2.5">
              {issues.map(issue => {
                const cfg = STATUS_CONFIG[issue.status] || STATUS_CONFIG.open
                const catCfg = CATEGORY_OPTIONS.find(c => c.value === issue.category)
                return (
                  <div key={issue.id} className="bg-white rounded-2xl shadow-card px-4 py-3.5">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="font-semibold text-charcoal text-sm leading-snug">{issue.subject}</p>
                      <span className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wide
                        px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{issue.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {catCfg && (
                        <span className="text-[10px] font-semibold text-gray-400 bg-gray-100
                          px-2 py-0.5 rounded-full">
                          {catCfg.label}
                        </span>
                      )}
                      <span className="text-[10px] text-gray-300">
                        {new Date(issue.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </ClientPortalShell>
  )
}

