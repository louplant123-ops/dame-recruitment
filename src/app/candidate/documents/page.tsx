'use client'

import { useEffect, useState } from 'react'
import { usePortalAuth, portalFetch } from '@/hooks/usePortalAuth'
import PortalShell from '../PortalShell'

interface Doc {
  id: string
  type: string
  name: string
  expiry_date: string | null
  status: string
}

interface DocsData {
  rtw_status: string
  rtw_share_code: string | null
  rtw_submitted_at: string | null
  documents: Doc[]
}

const RTW_CONFIG: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  verified: {
    label: 'Verified',
    bg: 'bg-green-50',
    text: 'text-green-700',
    icon: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z',
  },
  pending: {
    label: 'Pending review',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    icon: 'M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z',
  },
  not_submitted: {
    label: 'Not submitted',
    bg: 'bg-red-50',
    text: 'text-red-600',
    icon: 'M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z',
  },
}

export default function DocumentsPage() {
  const { candidate, loading } = usePortalAuth()
  const [data, setData] = useState<DocsData | null>(null)
  const [docsLoading, setDocsLoading] = useState(true)
  const [shareCode, setShareCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  useEffect(() => {
    if (!candidate) return
    portalFetch('/.netlify/functions/candidate-documents')
      .then(r => r.json())
      .then(d => { setData(d); setShareCode(d.rtw_share_code || '') })
      .catch(console.error)
      .finally(() => setDocsLoading(false))
  }, [candidate])

  async function submitRTW() {
    if (!shareCode.trim()) return
    setSubmitting(true)
    try {
      const res = await portalFetch('/.netlify/functions/candidate-documents', {
        method: 'POST',
        body: JSON.stringify({ shareCode: shareCode.trim() }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      setData(prev => prev ? { ...prev, rtw_status: 'pending', rtw_share_code: shareCode.trim() } : prev)
      flash('Share code submitted — your consultant will verify it shortly.', true)
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

  const rtw = data ? (RTW_CONFIG[data.rtw_status] || RTW_CONFIG.not_submitted) : null

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
          <h2 className="font-heading font-bold text-[22px] text-charcoal">Documents</h2>
          <p className="text-sm text-gray-400 mt-0.5">Right to work & compliance</p>
        </div>

        {docsLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-28 bg-gray-200 rounded-2xl" />
            <div className="h-20 bg-gray-200 rounded-2xl" />
          </div>
        ) : (
          <>
            {/* RTW card */}
            <div className="dame-portal-card overflow-hidden p-0">
              <div className="px-4 pt-4 pb-3">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold text-charcoal text-sm">Right to Work</p>
                  {rtw && (
                    <span className={`flex items-center gap-1.5 text-[11px] font-bold uppercase
                      tracking-wide px-2.5 py-1 rounded-full ${rtw.bg} ${rtw.text}`}>
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d={rtw.icon} clipRule="evenodd" />
                      </svg>
                      {rtw.label}
                    </span>
                  )}
                </div>

                {data?.rtw_status !== 'verified' && (
                  <div className="space-y-2.5">
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Enter your UK Visas &amp; Immigration share code to verify your right to work online.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={shareCode}
                        onChange={e => setShareCode(e.target.value.toUpperCase())}
                        placeholder="e.g. W4L-8PJ-3KX"
                        maxLength={12}
                        className="flex-1 bg-[#F0F2F5] rounded-xl px-3 py-2.5 text-sm font-mono
                                   text-charcoal placeholder:text-gray-300 focus:outline-none
                                   focus:ring-2 focus:ring-primary-red/30"
                      />
                      <button
                        onClick={submitRTW}
                        disabled={submitting || !shareCode.trim()}
                        className="px-4 py-2.5 bg-primary-red text-white text-sm font-bold rounded-xl
                                   disabled:opacity-40 active:scale-95 transition-all"
                      >
                        {submitting ? '…' : 'Submit'}
                      </button>
                    </div>
                  </div>
                )}

                {data?.rtw_status === 'verified' && (
                  <p className="text-xs text-gray-400">
                    Share code: <span className="font-mono font-semibold text-charcoal">{data.rtw_share_code}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Other docs */}
            {data && data.documents.length > 0 && (
              <div className="space-y-2.5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
                  On file
                </p>
                {data.documents.map(doc => {
                  const expired = doc.expiry_date && new Date(doc.expiry_date) < new Date()
                  const soon = !expired && doc.expiry_date &&
                    new Date(doc.expiry_date) < new Date(Date.now() + 30 * 86400000)
                  return (
                    <div key={doc.id} className="dame-portal-card px-4 py-3.5
                      flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#F0F2F5] rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-4.5 h-4.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-charcoal truncate">{doc.name}</p>
                        {doc.expiry_date && (
                          <p className={`text-xs mt-0.5 ${expired ? 'text-red-500 font-semibold' : soon ? 'text-yellow-600' : 'text-gray-400'}`}>
                            {expired ? '⚠ Expired ' : soon ? '⚡ Expires ': 'Expires '}
                            {new Date(doc.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full
                        ${doc.status === 'approved' ? 'bg-green-50 text-green-700'
                          : doc.status === 'pending' ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-red-50 text-red-600'}`}>
                        {doc.status}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {data && data.documents.length === 0 && (
              <div className="dame-portal-card p-6 text-center">
                <p className="text-sm text-gray-400">No compliance documents on file yet.</p>
              </div>
            )}
          </>
        )}
      </div>
    </PortalShell>
  )
}
