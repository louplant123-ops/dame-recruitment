import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Client Portal — Dame Recruitment',
  description: 'Manage your workforce, timesheets, and invoices with Dame Recruitment.',
  manifest: '/client-manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#C8102E',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function ClientPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      {children}
    </div>
  )
}
