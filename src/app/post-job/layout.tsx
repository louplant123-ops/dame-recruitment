import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Post a Job',
  description: 'Post a job vacancy with Dame Recruitment. Get same-day shortlists of qualified candidates for warehousing, manufacturing, and engineering roles across the East Midlands.',
  openGraph: {
    title: 'Post a Job | Dame Recruitment',
    description: 'Find the perfect candidates for your business. Same-day shortlists across the East Midlands.',
    url: 'https://www.damerecruitment.co.uk/post-job',
    siteName: 'Dame Recruitment',
  },
  alternates: {
    canonical: '/post-job',
  },
}

export default function PostJobLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
