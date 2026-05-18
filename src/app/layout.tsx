import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import LayoutShell from '@/components/LayoutShell'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s — Dame Recruitment',
    default: 'Dame Recruitment — People. Performance. Partnership.',
  },
  description: 'Premium recruitment partnerships across Leicester, Coventry and the East Midlands. Temporary and permanent staffing for teams that need reliable people and sharper performance.',
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
    title: 'Dame Recruitment — People. Performance. Partnership.',
    description: 'Premium recruitment partnerships across Leicester, Coventry and the East Midlands.',
    url: 'https://www.damerecruitment.co.uk',
    siteName: 'Dame Recruitment',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dame Recruitment — People. Performance. Partnership.',
    description: 'Premium recruitment partnerships across Leicester, Coventry and the East Midlands.',
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
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-GB" className={`${inter.variable} ${playfair.variable} scroll-smooth`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-body text-light-text bg-neutral-white antialiased">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  )
}
