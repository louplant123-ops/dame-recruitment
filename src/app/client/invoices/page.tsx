'use client'

import { useEffect, useState } from 'react'
import { useClientAuth, clientFetch } from '@/hooks/useClientAuth'
import ClientPortalShell from '../ClientPortalShell'

interface Invoice {
  id: string
  invoice_number: string
  invoice_date: string
  due_date: string | null
  amount: number
  vat_amount: number
  total_amount: number
  status: string
  payment_terms: string | null
  description: string | null
  paid_date: string | null
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  draft:     { label: 'Draft',     bg: 'bg-gray-100',    text: 'text-gray-500'   },
  sent:      { label: 'Due',       bg: 'bg-blue-50',     text: 'text-blue-700'   },
  overdue:   { label: 'Overdue',   bg: 'bg-red-50',      text: 'text-red-600'    },
  paid:      { label: 'Paid',      bg: 'bg-green-50',    text: 'text-green-700'  },
  cancelled: { label: 'Cancelled', bg: 'bg-gray-100',    text: 'text-gray-400'   },
}

function fmt(amount: number) {
  return `£${amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function InvoicesPage() {
  const { client, loading } = useClientAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [summary, setSummary] = useState({ outstanding: 0, paid: 0, total: 0 })
  const [dataLoading, setDataLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'sent' | 'paid' | 'overdue'>('all')

  useEffect(() => {
    if (!client) return
    clientFetch('/.netlify/functions/client-invoices')
      .then(r => r.json())
      .then(d => { setInvoices(d.invoices || []); setSummary(d.summary || {}) })
      .catch(console.error)
      .finally(() => setDataLoading(false))
  }, [client])

  if (loading) return null

  const visible = filter === 'all'
    ? invoices
    : invoices.filter(inv => inv.status === filter || (filter === 'sent' && inv.status === 'sent'))

  const overdueCount = invoices.filter(i => i.status === 'overdue').length

  return (
    <ClientPortalShell clientName={client?.name} company={client?.company ?? undefined}>
      <div className="space-y-4">
        <div>
          <h2 className="font-heading font-bold text-[22px] text-charcoal border-l-2 border-primary-red pl-3">Invoices</h2>
          <p className="text-sm text-gray-400 mt-0.5">Your billing history</p>
        </div>

        {/* Summary card */}
        {!dataLoading && (
          <div className="bg-white rounded-2xl shadow-card px-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 font-medium">Outstanding</p>
                <p className={`font-heading font-bold text-2xl leading-tight
                  ${summary.outstanding > 0 ? 'text-primary-red' : 'text-charcoal'}`}>
                  {fmt(summary.outstanding)}
                </p>
                {overdueCount > 0 && (
                  <p className="text-[11px] text-red-500 font-semibold mt-0.5">
                    {overdueCount} overdue
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Paid (all time)</p>
                <p className="font-heading font-bold text-2xl text-green-600 leading-tight">
                  {fmt(summary.paid)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex bg-white rounded-xl shadow-card p-1 gap-1 overflow-x-auto">
          {([['all','All'], ['sent','Due'], ['overdue','Overdue'], ['paid','Paid']] as const).map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              className={`flex-shrink-0 flex-1 py-2 text-xs font-bold rounded-lg transition-all
                ${filter === val ? 'bg-primary-red text-white' : 'text-gray-400 hover:text-gray-600'}`}>
              {label}
            </button>
          ))}
        </div>

        {dataLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-200 rounded-2xl" />)}
          </div>
        ) : visible.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-card">
            <p className="font-semibold text-charcoal text-sm">No invoices</p>
            <p className="text-gray-400 text-xs mt-1">
              {filter === 'all' ? 'Your invoices will appear here.' : `No ${filter} invoices.`}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {visible.map(inv => {
              const cfg = STATUS_CONFIG[inv.status] || STATUS_CONFIG.draft
              const dueDate = inv.due_date ? new Date(inv.due_date + 'T00:00:00') : null
              const isOverdue = inv.status === 'overdue' ||
                (dueDate && dueDate < new Date() && inv.status === 'sent')

              return (
                <div key={inv.id} className="bg-white rounded-2xl shadow-card px-4 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-charcoal text-sm">
                        Invoice #{inv.invoice_number}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(inv.invoice_date + 'T00:00:00').toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                        {dueDate && inv.status !== 'paid' && (
                          <span className={isOverdue ? ' · ⚠ Due ' + dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ` · Due ${dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`} />
                        )}
                        {inv.paid_date && ` · Paid ${new Date(inv.paid_date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                      </p>
                      {inv.description && (
                        <p className="text-[11px] text-gray-400 mt-0.5 truncate">{inv.description}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="font-heading font-bold text-charcoal text-base">
                        {fmt(inv.total_amount)}
                      </p>
                      <span className={`text-[10px] font-bold uppercase tracking-wide
                        px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                  {inv.vat_amount > 0 && (
                    <p className="text-[11px] text-gray-400 mt-1.5">
                      Net {fmt(inv.amount)} + VAT {fmt(inv.vat_amount)}
                    </p>
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

