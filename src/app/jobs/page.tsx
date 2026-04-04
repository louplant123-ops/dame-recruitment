import type { Metadata } from 'next'
import JobsClient from './JobsClient'

export const metadata: Metadata = {
  title: 'Current Vacancies',
  description: 'Browse live job vacancies across the East Midlands. Warehouse, manufacturing, and engineering roles with weekly pay, honest job descriptions, and temp-to-perm pathways.',
  keywords: ['jobs', 'vacancies', 'East Midlands', 'warehouse jobs', 'manufacturing jobs', 'engineering jobs', 'temp work', 'Leicester', 'Nottingham', 'Derby', 'Coventry'],
  openGraph: {
    title: 'Current Vacancies | Dame Recruitment',
    description: 'Browse live job vacancies across the East Midlands. Weekly pay, honest job descriptions, and roles that lead somewhere.',
    url: 'https://www.damerecruitment.co.uk/jobs',
    siteName: 'Dame Recruitment',
  },
  alternates: {
    canonical: '/jobs',
  },
}

export default function JobsPage() {
  return <JobsClient />
}
