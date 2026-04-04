import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Register With Us',
  description: 'Register with Dame Recruitment to access the best temporary and permanent job opportunities across the East Midlands. Weekly pay, honest job descriptions, and a dedicated consultant.',
  keywords: ['register', 'sign up', 'job seeker', 'candidate registration', 'East Midlands jobs', 'temporary work', 'permanent jobs'],
  openGraph: {
    title: 'Register With Us | Dame Recruitment',
    description: 'Join our talent pool and get access to the best job opportunities across the East Midlands.',
    url: 'https://www.damerecruitment.co.uk/register',
    siteName: 'Dame Recruitment',
  },
  alternates: {
    canonical: '/register',
  },
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
