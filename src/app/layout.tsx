import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import LayoutShell from '@/components/LayoutShell'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s — Dame Recruitment',
    default: 'Dame Recruitment — Professional Staffing Solutions in the East Midlands',
  },
  description: 'Professional recruitment services across Leicester, Coventry and the East Midlands. Temporary and permanent staffing solutions for employers and career opportunities for candidates.',
  keywords: ['recruitment', 'staffing', 'jobs', 'Leicester', 'Coventry', 'East Midlands', 'temporary', 'permanent'],
  authors: [{ name: 'Dame Recruitment' }],
  creator: 'Dame Recruitment',
  publisher: 'Dame Recruitment',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.damerecruitment.co.uk'),
  openGraph: {
    title: 'Dame Recruitment — Professional Staffing Solutions',
    description: 'Professional recruitment services across Leicester, Coventry and the East Midlands.',
    url: 'https://www.damerecruitment.co.uk',
    siteName: 'Dame Recruitment',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dame Recruitment — Professional Staffing Solutions',
    description: 'Professional recruitment services across Leicester, Coventry and the East Midlands.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'EmploymentAgency'],
  '@id': 'https://www.damerecruitment.co.uk/#organization',
  name: 'Dame Recruitment',
  url: 'https://www.damerecruitment.co.uk',
  logo: 'https://www.damerecruitment.co.uk/dame-logo.png',
  image: 'https://www.damerecruitment.co.uk/og-image.png',
  description:
    'East Midlands recruitment specialists providing temporary and permanent staffing for warehousing, manufacturing and engineering across Leicester, Nottingham, Derby and Coventry.',
  areaServed: [
    { '@type': 'City', name: 'Leicester' },
    { '@type': 'City', name: 'Nottingham' },
    { '@type': 'City', name: 'Derby' },
    { '@type': 'City', name: 'Coventry' },
    { '@type': 'AdministrativeArea', name: 'East Midlands' },
  ],
  address: {
    '@type': 'PostalAddress',
    addressRegion: 'East Midlands',
    addressCountry: 'GB',
  },
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://www.damerecruitment.co.uk/#website',
  url: 'https://www.damerecruitment.co.uk',
  name: 'Dame Recruitment',
  publisher: { '@id': 'https://www.damerecruitment.co.uk/#organization' },
  inLanguage: 'en-GB',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-GB" className={`${inter.variable} scroll-smooth`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap"
        />
      </head>
      <body className="font-body antialiased">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  )
}
