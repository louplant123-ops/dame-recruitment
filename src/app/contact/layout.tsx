import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Dame Recruitment. Whether you need staff or are looking for work, our East Midlands recruitment specialists are here to help.',
  keywords: ['contact', 'get in touch', 'recruitment enquiry', 'Dame Recruitment', 'East Midlands'],
  openGraph: {
    title: 'Contact Us | Dame Recruitment',
    description: 'Get in touch with our team of recruitment specialists across the East Midlands.',
    url: 'https://www.damerecruitment.co.uk/contact',
    siteName: 'Dame Recruitment',
  },
  alternates: {
    canonical: '/contact',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
