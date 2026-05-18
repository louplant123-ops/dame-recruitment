'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePortalAuth, portalFetch } from '@/hooks/usePortalAuth'
import PortalShell from '../PortalShell'

interface MeData {
  candidate: { id: string; name: string; email: string; phone: string; registrationType: string; rightToWork: string | null; visaExpiry: string | null }
  consultant: { name: string; email: string; phone: string } | null
  placement: { id: string; client_name: string; job_title: string; start_date: string; status: string; placement_type: string } | null
  registrationProgress: { completed: number; total: number }
  stats: { upcomingShifts: number; pendingHolidays: number }
}

export default function DashboardPage() {
  const { candidate, loading } = usePortalAuth()
  const [me, setMe] = useState<MeData | null>(null)
  const [meLoading, setMeLoading] = useState(true)

  useEffect(() => {
    if (!candidate) return
    portalFetch('/.netlify/functions/candidate-me')
      .then(r => r.json())
      .then(setMe)
      .catch(console.error)
      .finally(() => setMeLoading(false))
  }, [candidate])

  if (loading) return null

  const isPerm = candidate?.registrationType === 'perm' || me?.placement?.placement_type === 'perm'
  const firstName = candidate?.name?.split(' ')[0] || 'there'

  return (
    <PortalShell candidateName={candidate?.name} registrationType={candidate?.registrationType}>
      <div className="space-y-5 animate-fade-in">

        {/* Greeting row */}
        <div>
          <h2 className="font-heading font-bold text-[22px] text-charcoal leading-tight">
            Good {getTimeOfDay()}, {firstName}
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {meLoading ? <DashboardSkeleton /> : (
          <>
            {/* Placement hero card */}
            {me?.placement && (
              <div className="relative overflow-hidden rounded-2xl shadow-lift">
                <div className="bg-gradient-hero px-5 py-5">
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
                  <div className="absolute bottom-0 right-8 w-20 h-20 rounded-full bg-primary-red/30 translate-y-6" />
                  <div className="relative">
                    <span className="inline-block text-[10px] font-bold uppercase tracking-widest
                                     text-white/50 mb-2">
                      {me.placement.placement_type === 'perm' ? 'Permanent role' : 'Current placement'}
                    </span>
                    <p className="font-heading font-bold text-xl text-white leading-tight">
                      {me.placement.job_title || 'Your placement'}
                    </p>
                    <p className="text-white/60 text-sm mt-0.5">{me.placement.client_name}</p>
                    {me.placement.start_date && (
                      <p className="text-white/40 text-xs mt-3 flex items-center gap-1.5">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        Started {new Date(me.placement.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Registration progress */}
            {!me?.placement && me?.registrationProgress && (
              <div className="dame-portal-card">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-charcoal text-sm">Registration progress</p>
                  <span className="text-xs font-bold text-accent-teal">
                    {me.registrationProgress.completed}/{me.registrationProgress.total}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-teal transition-all duration-700"
                    style={{ width: `${(me.registrationProgress.completed / me.registrationProgress.total) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2.5 leading-relaxed">
                  {me.registrationProgress.completed < me.registrationProgress.total
                    ? 'Complete your registration to get matched with work.'
                    : 'All done — your consultant will be in touch shortly.'}
                </p>
              </div>
            )}

            {/* Stats row */}
            {(me?.stats.upcomingShifts !== undefined || me?.stats.pendingHolidays !== undefined) && (
              <div className="grid grid-cols-2 gap-3">
                {!isPerm && me?.stats.upcomingShifts !== undefined && (
                  <Link href="/candidate/shifts">
                    <StatPill
                      value={me.stats.upcomingShifts}
                      label="upcoming shifts"
                      colour="red"
                    />
                  </Link>
                )}
                {!isPerm && me?.stats.pendingHolidays !== undefined && (
                  <Link href="/candidate/holiday">
                    <StatPill
                      value={me.stats.pendingHolidays}
                      label="holiday requests"
                      colour="purple"
                    />
                  </Link>
                )}
              </div>
            )}

            {/* Quick actions */}
            <div>
              <p className="dame-eyebrow mb-3">Quick actions</p>
              <div className="grid grid-cols-2 gap-3">
                {!isPerm && (
                  <ActionCard href="/candidate/shifts" label="My shifts" sub={me?.stats.upcomingShifts !== undefined ? `${me.stats.upcomingShifts} coming up` : 'View schedule'} colour="red"
                    icon={<path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />} />
                )}
                {isPerm && (
                  <ActionCard href="/candidate/checklist" label="Checklist" sub="Pre-start steps" colour="teal"
                    icon={<path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8.414A2 2 0 0019.414 7L14 1.586A2 2 0 0012.586 1H6zm5 7a1 1 0 10-2 0v3.586L7.707 11.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 12.586V9z" clipRule="evenodd" />} />
                )}
                <ActionCard href="/candidate/documents" label="Documents" sub={me?.candidate.rightToWork ? 'Up to date' : 'Action needed'} colour={me?.candidate.rightToWork ? 'gray' : 'yellow'}
                  icon={<path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />} />
                {!isPerm && (
                  <ActionCard href="/candidate/holiday" label="Holiday" sub="Request time off" colour="indigo"
                    icon={<path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />} />
                )}
                <ActionCard href="/candidate/refer" label="Refer a friend" sub="Spread the word" colour="green"
                  icon={<path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />} />
              </div>
            </div>

            {/* Consultant card */}
            {me?.consultant && (
              <div className="dame-portal-card">
                <p className="dame-eyebrow mb-3">Your consultant</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 dame-icon-chip flex-shrink-0">
                    <span className="text-white font-bold text-sm">
                      {me.consultant.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-charcoal text-sm truncate">{me.consultant.name}</p>
                    <p className="text-gray-400 text-xs">Dame Recruitment</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {me.consultant.phone && (
                      <a href={`tel:${me.consultant.phone}`}
                        className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center active:scale-95 transition-all">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                      </a>
                    )}
                    {me.consultant.email && (
                      <a href={`mailto:${me.consultant.email}`}
                        className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center active:scale-95 transition-all">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PortalShell>
  )
}

function StatPill({ value, label, colour }: { value: number; label: string; colour: 'red' | 'purple' }) {
  const textColours = { red: 'text-primary-red', purple: 'text-purple-600' }
  return (
    <div className="dame-portal-card active:scale-[0.97] transition-all">
      <p className={`font-heading font-bold text-2xl ${textColours[colour]}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5 leading-tight">{label}</p>
    </div>
  )
}

const ACTION_COLOURS: Record<string, { bg: string; icon: string }> = {
  red:    { bg: 'bg-red-50',    icon: 'text-primary-red' },
  teal:   { bg: 'bg-teal-50',   icon: 'text-accent-teal' },
  green:  { bg: 'bg-green-50',  icon: 'text-accent-green' },
  indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600' },
  yellow: { bg: 'bg-yellow-50', icon: 'text-yellow-600' },
  gray:   { bg: 'bg-gray-50',   icon: 'text-gray-400' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600' },
}

function ActionCard({ href, label, sub, icon, colour }: {
  href: string; label: string; sub: string
  icon: React.ReactNode; colour: string
}) {
  const c = ACTION_COLOURS[colour] || ACTION_COLOURS.gray
  return (
    <Link href={href}
      className="dame-portal-action">
      <div className={`w-10 h-10 dame-icon-chip mb-3 ${c.bg}`}>
        <svg className={`w-5 h-5 ${c.icon}`} fill="currentColor" viewBox="0 0 20 20">{icon}</svg>
      </div>
      <p className="font-semibold text-charcoal text-sm leading-tight">{label}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </Link>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-28 bg-gray-200 rounded-2xl" />
      <div className="grid grid-cols-2 gap-3">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
      </div>
      <div className="h-20 bg-gray-200 rounded-2xl" />
    </div>
  )
}

function getTimeOfDay(): string {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
