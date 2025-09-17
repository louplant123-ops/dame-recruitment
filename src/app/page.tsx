import type { Metadata } from 'next'
import Link from 'next/link'
import LazySection from '@/components/LazySection'

export const metadata: Metadata = {
  title: 'East Midlands Recruitment Specialists | Dame Recruitment',
  description: 'Reliable temps and permanent staff for warehousing, manufacturing & engineering. Same-day shortlists, weekly pay, honest job descriptions across Leicester, Nottingham, Derby.',
  keywords: ['recruitment', 'East Midlands', 'warehouse jobs', 'manufacturing jobs', 'engineering jobs', 'Leicester', 'Nottingham', 'Derby', 'temp agency', 'permanent recruitment'],
  openGraph: {
    title: 'Dame Recruitment - Staff that show up. Results that count.',
    description: 'East Midlands recruitment specialists delivering reliable temps and permanent hires when you need them most.',
    type: 'website',
    locale: 'en_GB',
  },
  alternates: {
    canonical: '/',
  },
}

export default function HomePage() {
  return (
    <main className="relative">
      {/* Hero Section */}
      <section className="relative bg-charcoal overflow-hidden min-h-[520px] lg:min-h-[70vh] flex items-center">
        {/* Geometric Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 border border-white rotate-45"></div>
          <div className="absolute top-40 right-20 w-24 h-24 border border-white rotate-12"></div>
          <div className="absolute bottom-32 left-1/4 w-16 h-16 border border-white -rotate-45"></div>
          <div className="absolute bottom-20 right-1/3 w-20 h-20 border border-white rotate-30"></div>
          {/* Additional angled lines */}
          <div className="absolute top-1/3 left-1/2 w-40 h-px bg-white rotate-12 transform -translate-x-1/2"></div>
          <div className="absolute bottom-1/3 right-1/4 w-32 h-px bg-white -rotate-12"></div>
        </div>
        
        <div className="relative max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 w-full">
          <div className="text-center">
            {/* Main Headline */}
            <h1 className="text-h1 lg:text-h1-lg font-heading font-bold text-white mb-6">
              Recruitment made simple.
            </h1>
            
            {/* Sub-headline */}
            <p className="text-body-lg font-body mb-16 max-w-prose mx-auto" style={{ color: '#E8E8E8' }}>
              East Midlands temps &amp; perms — reliable people, fast.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
              <Link
                href="/jobs"
                className="bg-primary-red text-white px-8 py-4 rounded-lg font-body font-semibold text-lg btn-lift hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-offset-2 focus:ring-offset-charcoal"
                aria-label="Browse available jobs"
              >
                Browse Jobs
              </Link>
              <Link
                href="/employers"
                className="bg-white border-2 border-charcoal text-charcoal px-8 py-4 rounded-lg font-body font-semibold text-lg btn-lift hover:bg-primary-red hover:text-white hover:border-primary-red transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-charcoal"
                aria-label="Learn about hiring with Dame Recruitment"
              >
                Hire with Dame
              </Link>
            </div>
            
            {/* Credibility Row */}
            <div className="inline-block bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 border border-white/20">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-white font-body text-body">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent-teal rounded-full"></div>
                  <span>Same-day shortlists</span>
                </div>
                <div className="hidden sm:block text-white/40">•</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent-yellow rounded-full"></div>
                  <span>Weekly pay</span>
                </div>
                <div className="hidden sm:block text-white/40">•</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent-blue rounded-full"></div>
                  <span>Temp-to-perm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props Section */}
      <LazySection>
        <section className="py-20 bg-neutral-light section-accent-teal">
            <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
              {/* Section Intro */}
              <div className="text-center mb-16">
                <p className="text-body-lg font-body text-charcoal/70 max-w-prose mx-auto">
                  Whether you&apos;re hiring or looking for work, we deliver what matters most: reliability, speed, and results.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
                
                {/* Employers Column */}
                <div>
                  <h2 className="text-h2 font-heading font-bold text-charcoal mb-8">
                    For Employers
                  </h2>
                  <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-accent-teal rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-h3 font-heading font-semibold text-charcoal mb-2">Same-day shortlists</h3>
                    <p className="text-body font-body text-charcoal/70">Stop waiting weeks for candidates. Get qualified shortlists within hours of your brief.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-accent-yellow rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-h3 font-heading font-semibold text-charcoal mb-2">No-show protection</h3>
                    <p className="text-body font-body text-charcoal/70">Our three-step vetting process means reliable attendance and fewer Monday morning surprises.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-accent-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-h3 font-heading font-semibold text-charcoal mb-2">Backup talent ready</h3>
                    <p className="text-body font-body text-charcoal/70">Pre-vetted replacements on standby for last-minute changes or unexpected absences.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-accent-green rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-h3 font-heading font-semibold text-charcoal mb-2">Transparent pricing</h3>
                    <p className="text-body font-body text-charcoal/70">Clear rates upfront. No hidden fees, no surprise charges, no complicated contracts.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Candidates Column */}
            <div>
              <h2 className="text-h2 font-heading font-bold text-charcoal mb-8">
                For Job Seekers
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-accent-teal rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-h3 font-heading font-semibold text-charcoal mb-2">Weekly pay guaranteed</h3>
                    <p className="text-body font-body text-charcoal/70">Get paid every Friday without fail. No waiting around for monthly payslips.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-accent-yellow rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-h3 font-heading font-semibold text-charcoal mb-2">Work close to home</h3>
                    <p className="text-body font-body text-charcoal/70">Local opportunities across Nottingham, Leicester, Derby, and surrounding areas.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-accent-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-h3 font-heading font-semibold text-charcoal mb-2">Honest job briefings</h3>
                    <p className="text-body font-body text-charcoal/70">No surprises on day one. We tell you exactly what the role involves before you start.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-accent-green rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-h3 font-heading font-semibold text-charcoal mb-2">Temp-to-perm pathway</h3>
                    <p className="text-body font-body text-charcoal/70">Prove yourself in temporary roles and convert to permanent positions with employers you like.</p>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
          </div>
        </section>
      </LazySection>
    </main>
  )
}
