import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Job vacancy | Dame Recruitment',
  description: 'View vacancy details and apply with Dame Recruitment.',
}

export default function JobLoaderLayout({ children }: { children: ReactNode }) {
  return children
}
