'use client'

import { useEffect, useState } from 'react'
import { useClientAuth, clientFetch } from '@/hooks/useClientAuth'
import ClientPortalShell from '../ClientPortalShell'

interface KID {
  id: string
  worker_name: string
  worker_email: string | null
  job_title: string
  kid_sent_at: string
  acknowledged: boolean
  acknowledged_at: string | null
  acknowledged_via: string | null
  placement_type: string
  start_date: string
  kid_html: string | null
}

interface RtwDoc {
  id: string
  worker_name: string
  document_type: string
  document_name: string
  status: string
  expiry_date: string | null
}

export default function DocumentsPage() {
  const { client, loading } = useClientAuth()
  const [kids, setKids]       = useState<KID[]>([])
  const [rtwDocs, setRtwDocs] = useState<RtwDoc[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const [tab, setTab] = useState<'kid' | 'rtw'>('kid')

  useEffect(() => {
    if (!client) return
    clientFetch('/.netlify/functions/client-documents')
      .then(r => r.json())
      .then(d => { setKids(d.kids || []); setRtwDocs(d.rtwDocs || []) })
      .catch(console.error)
      .finally(() => setDataLoading(false))
  }, [client])

  if (loading) return null

  return (
    <ClientPortalShell clientName={client?.name} company={client?.company ?? undefined}>
      {/* KID preview modal */}
      {previewHtml && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end justify-center"
          onClick={() => setPreviewHtml(null)}>
          <div className="bg-white w-full max-w-lg rounded-t-3xl max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 sticky top-0 bg-white">
              <p className="font-bold text-charcoal text-sm">Key Information Document</p>
              <button onClick={() => setPreviewHtml(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-4 py-4 text-xs prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h2 className="font-heading font-bold text-[22px] text-charcoal border-l-2 border-primary-red pl-3">Documents</h2>
          <p className="text-sm text-gray-400 mt-0.5">KIDs &amp; right to work</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-xl shadow-card p-1 gap-1">
          <button onClick={() => setTab('kid')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all
              ${tab === 'kid' ? 'bg-primary-red text-white' : 'text-gray-400 hover:text-gray-600'}`}>
            KIDs ({kids.length})
          </button>
          <button onClick={() => setTab('rtw')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all
              ${tab === 'rtw' ? 'bg-primary-red text-white' : 'text-gray-400 hover:text-gray-600'}`}>
            Right to Work ({rtwDocs.length})
          </button>
        </div>

        {dataLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-200 rounded-2xl" />)}
          </div>
        ) : tab === 'kid' ? (
          kids.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-card">
              <p className="font-semibold text-charcoal text-sm">No KIDs on record</p>
              <p className="text-gray-400 text-xs mt-1">
                Key information documents appear here once workers are placed.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {kids.map(kid => (
                <div key={kid.id} className="bg-white rounded-2xl shadow-card px-4 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-charcoal text-sm">{kid.worker_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{kid.job_title}</p>
                      <p className="text-[11px] text-gray-300 mt-0.5">
                        Issued {new Date(kid.kid_sent_at).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full
                        ${kid.acknowledged ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-600'}`}>
                        {kid.acknowledged ? 'Acknowledged' : 'Not acknowledged'}
                      </span>
                      {kid.kid_html && (
                        <button
                          onClick={() => setPreviewHtml(kid.kid_html!)}
                          className="text-[11px] font-semibold text-primary-red hover:underline">
                          View KID
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          rtwDocs.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-card">
              <p className="font-semibold text-charcoal text-sm">No RTW documents on record</p>
              <p className="text-gray-400 text-xs mt-1">
                Right to work documents appear here for your active workers.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {rtwDocs.map(doc => {
                const expired = doc.expiry_date && new Date(doc.expiry_date) < new Date()
                const soon = !expired && doc.expiry_date &&
                  new Date(doc.expiry_date) < new Date(Date.now() + 30 * 86400000)
                return (
                  <div key={doc.id} className="bg-white rounded-2xl shadow-card px-4 py-3.5
                    flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                      ${doc.status === 'approved' ? 'bg-green-50' : 'bg-yellow-50'}`}>
                      <svg className={`w-5 h-5 ${doc.status === 'approved' ? 'text-green-500' : 'text-yellow-500'}`}
                        fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-charcoal truncate">{doc.worker_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{doc.document_name}</p>
                      {doc.expiry_date && (
                        <p className={`text-[11px] mt-0.5 font-medium
                          ${expired ? 'text-red-500' : soon ? 'text-yellow-600' : 'text-gray-400'}`}>
                          {expired ? '⚠ Expired ' : soon ? '⚡ Expires ' : 'Expires '}
                          {new Date(doc.expiry_date + 'T00:00:00').toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </p>
                      )}
                    </div>
                    <span className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wide
                      px-2 py-1 rounded-full
                      ${doc.status === 'approved' ? 'bg-green-50 text-green-700'
                        : 'bg-yellow-50 text-yellow-700'}`}>
                      {doc.status}
                    </span>
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>
    </ClientPortalShell>
  )
}

