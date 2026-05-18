'use client'

import { useEffect, useState } from 'react'
import { useClientAuth, clientFetch } from '@/hooks/useClientAuth'
import ClientPortalShell from '../ClientPortalShell'
import Link from 'next/link'

function fmtShort(amount: number): string {
  if (amount >= 1000) return `£${(amount / 1000).toFixed(1)}k`
  return `£${Math.round(amount)}`
}

interface DashStats {
  activePlacements: number
  workersThisWeek: number
  pendingTimesheets: number
  outstandingTotal: number
  openIssues: number
}

interface Consultant {
  name: string
  email: string
  phone: string
}

export default function ClientDashboardPage() {
  const { client, loading } = useClientAuth()
  const [stats, setStats]           = useState<DashStats | null>(null)
  const [consultant, setConsultant] = useState<Consultant | null>(null)
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!client) return
    clientFetch('/.netlify/functions/client-me')
      .then(r => r.json())
      .then(d => {
        setStats(d.stats || null)
        setConsultant(d.consultant || null)
      })
      .catch(console.error)
      .finally(() => setDataLoading(false))
  }, [client])

  if (loading) return null

  return (
    <ClientPortalShell
      clientName={client?.name}
      company={client?.company ?? undefined}
      pendingTimesheets={stats?.pendingTimesheets}
    >
      <div className="space-y-4">
        {/* Hero card */}
        {dataLoading ? (
          <div className="h-44 bg-gray-200 rounded-3xl animate-pulse" />
        ) : (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br
            from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-5 shadow-lift-lg">
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/[0.03] rounded-full" />
            <div className="absolute -right-4 top-12 w-24 h-24 bg-white/[0.03] rounded-full" />
            <div className="absolute right-6 bottom-4 w-12 h-12 bg-primary-red/20 rounded-full" />

            <div className="flex items-center gap-2 mb-3 relative z-10">
              <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">
                Workforce summary
              </span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className="text-white/30 text-[10px] font-medium">
                {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>
            <h2 className="text-white font-heading font-bold text-3xl mb-4 relative z-10 leading-tight">
              {stats?.workersThisWeek ?? 0}
              <span className="text-white/50 text-xl font-normal ml-2">
                on site this week
              </span>
            </h2>

            <div className="flex gap-3 relative z-10 flex-wrap">
              <div className="bg-white/10 rounded-xl px-3 py-2 flex-1 min-w-[80px]">
                <p className="text-white/40 text-[10px] font-medium">Placements</p>
                <p className="text-white font-heading font-bold text-xl">{stats?.activePlacements ?? 0}</p>
              </div>
              <div className={`rounded-xl px-3 py-2 flex-1 min-w-[80px]
                ${(stats?.pendingTimesheets ?? 0) > 0 ? 'bg-yellow-500/20' : 'bg-white/10'}`}>
                <p className="text-white/40 text-[10px] font-medium">Timesheets</p>
                <p className={`font-heading font-bold text-xl
                  ${(stats?.pendingTimesheets ?? 0) > 0 ? 'text-yellow-300' : 'text-white'}`}>
                  {stats?.pendingTimesheets ?? 0}
                  {(stats?.pendingTimesheets ?? 0) > 0 && (
                    <span className="text-[10px] font-normal text-yellow-400 ml-1">pending</span>
                  )}
                </p>
              </div>
              <div className={`rounded-xl px-3 py-2 flex-1 min-w-[80px]
                ${(stats?.outstandingTotal ?? 0) > 0 ? 'bg-red-500/20' : 'bg-white/10'}`}>
                <p className="text-white/40 text-[10px] font-medium">Outstanding</p>
                <p className={`font-heading font-bold text-xl
                  ${(stats?.outstandingTotal ?? 0) > 0 ? 'text-red-300' : 'text-white'}`}>
                  {fmtShort(stats?.outstandingTotal ?? 0)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              href: '/client/timesheets',
              label: 'Approve Timesheets',
              sub: stats?.pendingTimesheets ? `${stats.pendingTimesheets} awaiting approval` : 'All up to date',
              icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
              bg: 'dame-portal-action',
              iconColor: (stats?.pendingTimesheets ?? 0) > 0 ? 'text-yellow-600' : 'text-gray-400',
              filled: false,
            },
            {
              href: '/client/workforce',
              label: 'View Workforce',
              sub: `${stats?.workersThisWeek ?? 0} on site this week`,
              icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
              bg: 'dame-portal-action',
              iconColor: 'text-blue-500',
              filled: false,
            },
            {
              href: '/client/invoices',
              label: 'Invoices',
              sub: (stats?.outstandingTotal ?? 0) > 0
                ? `£${(stats?.outstandingTotal ?? 0).toLocaleString()} outstanding`
                : 'No outstanding invoices',
              icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
              bg: 'dame-portal-action',
              iconColor: 'text-green-500',
              filled: false,
            },
            {
              href: '/client/reports',
              label: 'MI Reports',
              sub: 'Fill rate & analytics',
              icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
              bg: 'dame-portal-action',
              iconColor: 'text-purple-500',
              filled: false,
            },
          ].map(card => (
            <Link key={card.href} href={card.href}
              className={`${card.bg} flex flex-col gap-2`}>
              <div className={`w-9 h-9 dame-icon-chip ${card.iconColor}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                </svg>
              </div>
              <div>
                <p className="font-bold text-charcoal text-sm leading-tight">{card.label}</p>
                <p className="text-gray-400 text-[11px] mt-0.5 leading-snug">{card.sub}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Extra actions row */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/client/documents"
            className="dame-portal-action flex items-center gap-3">
            <div className="w-9 h-9 dame-icon-chip text-indigo-500 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="font-bold text-charcoal text-sm leading-tight">Documents</p>
              <p className="text-gray-400 text-[11px] mt-0.5">KIDs &amp; RTW packs</p>
            </div>
          </Link>

          <Link href="/client/issues"
            className="dame-portal-action flex items-center gap-3">
            <div className={`w-9 h-9 dame-icon-chip flex-shrink-0
              ${(stats?.openIssues ?? 0) > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="font-bold text-charcoal text-sm leading-tight">Issues</p>
              <p className="text-gray-400 text-[11px] mt-0.5">
                {(stats?.openIssues ?? 0) > 0 ? `${stats?.openIssues} open` : 'Flag a problem'}
              </p>
            </div>
          </Link>
        </div>

        {/* Consultant contact */}
        {consultant && (
          <div className="dame-portal-card">
            <p className="dame-eyebrow mb-2">
              Your consultant
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 dame-icon-chip flex-shrink-0">
                <span className="text-primary-red font-bold text-sm">
                  {(consultant.name || '?').charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-charcoal text-sm">{consultant.name}</p>
                <p className="text-xs text-gray-400 truncate">{consultant.email}</p>
              </div>
              {consultant.phone && (
                <a href={`tel:${consultant.phone}`}
                  className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center
                    text-green-600 flex-shrink-0 active:scale-95 transition-all">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </ClientPortalShell>
  )
}
