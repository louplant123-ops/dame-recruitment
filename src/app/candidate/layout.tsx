import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'My Portal — Dame Recruitment',
  description: 'Your personal Dame Recruitment candidate portal.',
  manifest: '/candidate-manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#C8102E',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function CandidatePortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-light">
      {children}
    </div>
  )
}
