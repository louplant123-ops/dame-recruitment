'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clearSession } from '@/hooks/usePortalAuth'
import { useRouter } from 'next/navigation'

interface NavItem {
  href: string
  label: string
  icon: (active: boolean) => React.ReactNode
  tempOnly?: boolean
  permOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/candidate/dashboard',
    label: 'Home',
    icon: (active) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.75} viewBox="0 0 24 24">
        {active
          ? <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          : <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />}
      </svg>
    ),
  },
  {
    href: '/candidate/shifts',
    label: 'Shifts',
    tempOnly: true,
    icon: (active) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.75} viewBox="0 0 24 24">
        {active
          ? <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          : <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />}
      </svg>
    ),
  },
  {
    href: '/candidate/checklist',
    label: 'Checklist',
    permOnly: true,
    icon: (active) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.75} viewBox="0 0 24 24">
        {active
          ? <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8.414A2 2 0 0019.414 7L14 1.586A2 2 0 0012.586 1H6zm5 7a1 1 0 10-2 0v3.586L7.707 11.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 12.586V9z" clipRule="evenodd" />
          : <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />}
      </svg>
    ),
  },
  {
    href: '/candidate/documents',
    label: 'Documents',
    icon: (active) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.75} viewBox="0 0 24 24">
        {active
          ? <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          : <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
      </svg>
    ),
  },
  {
    href: '/candidate/availability',
    label: 'Avail.',
    tempOnly: true,
    icon: (active) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.75} viewBox="0 0 24 24">
        {active
          ? <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          : <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
      </svg>
    ),
  },
  {
    href: '/candidate/holiday',
    label: 'Holiday',
    tempOnly: true,
    icon: (active) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.75} viewBox="0 0 24 24">
        {active
          ? <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          : <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />}
      </svg>
    ),
  },
  {
    href: '/candidate/refer',
    label: 'Refer',
    icon: (active) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.75} viewBox="0 0 24 24">
        {active
          ? <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          : <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />}
      </svg>
    ),
  },
]

interface PortalShellProps {
  children: React.ReactNode
  candidateName?: string
  registrationType?: string
}

export default function PortalShell({ children, candidateName, registrationType }: PortalShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const isPerm = registrationType === 'perm'

  const visibleNav = NAV_ITEMS.filter(item => {
    if (item.tempOnly && isPerm) return false
    if (item.permOnly && !isPerm) return false
    return true
  })

  function handleLogout() {
    clearSession()
    router.push('/candidate/login')
  }

  const currentPage = NAV_ITEMS.find(n => pathname === n.href || pathname?.startsWith(n.href + '/'))

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col pb-24 text-white">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-white/10 px-5 pt-5 pb-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(0,229,255,0.16),transparent_34%),radial-gradient(circle_at_90%_20%,rgba(255,77,109,0.12),transparent_32%)]" />
        <div className="max-w-lg mx-auto">
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="dame-mark-gradient block flex-shrink-0">
                <span className="h-10 w-10 text-3xl">D</span>
              </span>
              <div>
                <p className="text-accent-teal text-[10px] font-bold uppercase tracking-widest leading-none mb-0.5">
                  Dame Recruitment
                </p>
                <p className="text-white font-heading font-bold text-base leading-tight">
                  {candidateName ? `Hi, ${candidateName.split(' ')[0]}` : 'My Portal'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-white/50 text-xs font-medium
                         py-1.5 px-3 rounded-full border border-white/10 bg-white/5 hover:border-white/25
                         hover:text-white transition-all active:scale-95"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="flex-1 max-w-lg mx-auto w-full px-4 pt-5">
        {children}
      </div>

      {/* Bottom tab bar */}
      <div
        className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-charcoal/90 backdrop-blur-xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <nav className="max-w-lg mx-auto flex">
          {visibleNav.map(item => {
            const active = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors
                  ${active ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
              >
                <div className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all
                  ${active ? 'bg-gradient-neon shadow-glow' : ''}`}>
                  {item.icon(active)}
                  {active && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-red" />
                  )}
                </div>
                <span className={`text-[9px] font-semibold tracking-wide uppercase
                  ${active ? 'text-white' : 'text-white/30'}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
