import type { Metadata } from 'next'
import { Montserrat, Lato } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

const lato = Lato({
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  variable: '--font-lato',
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
  metadataBase: new URL('https://dame-recruitment.com'),
  openGraph: {
    title: 'Dame Recruitment — Professional Staffing Solutions',
    description: 'Professional recruitment services across Leicester, Coventry and the East Midlands.',
    url: 'https://dame-recruitment.com',
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
    <html lang="en-GB" className={`${montserrat.variable} ${lato.variable} scroll-smooth`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-body text-light-text bg-neutral-white antialiased">
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
