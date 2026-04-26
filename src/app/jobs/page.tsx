import type { Metadata } from 'next'
import JobsClient from './JobsClient'

export const metadata: Metadata = {
  title: 'Current Vacancies',
  description: 'Browse permanent and temporary job vacancies across the East Midlands. Warehouse, manufacturing, and engineering roles with career pathways and honest job descriptions.',
  keywords: ['jobs', 'vacancies', 'East Midlands', 'permanent jobs', 'warehouse jobs', 'manufacturing jobs', 'engineering jobs', 'temp work', 'career opportunities', 'Leicester', 'Nottingham', 'Derby', 'Coventry'],
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
